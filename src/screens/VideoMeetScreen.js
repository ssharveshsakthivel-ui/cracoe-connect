import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Link as LinkIcon,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Users,
  MoreVertical,
  CheckCircle2,
  X
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';

const sanitizeRoom = (value) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const createPeerId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `peer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const SIGNALING_URL =
  process.env.REACT_APP_SIGNALING_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  'ws://localhost:3000/ws';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

export default function VideoMeetScreen() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roomFromUrl = params.get('room') || '';

  const currentUser = useDataStore((state) => state.getCurrentUser());
  const messages = useDataStore((state) => state.messages);
  const meetings = useDataStore((state) => state.meetings);
  const sendSharedMessage = useDataStore((state) => state.sendSharedMessage);
  const addMeeting = useDataStore((state) => state.addMeeting);
  const addToast = useDataStore((state) => state.addToast);

  const [roomName, setRoomName] = useState(roomFromUrl);
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [joined, setJoined] = useState(false);
  const [hostMode, setHostMode] = useState(!roomFromUrl);
  const [lobbyEnabled, setLobbyEnabled] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState([]);
  
  // UI States
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState('people'); // people, chat, info

  const localVideoRef = useRef(null);
  const wsRef = useRef(null);
  const peerIdRef = useRef(createPeerId());
  const peersRef = useRef(new Map());
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const roomSlug = useMemo(() => sanitizeRoom(roomName), [roomName]);

  const meetingLink = useMemo(() => {
    if (!roomSlug) return '';
    return `${window.location.origin}/video-meet?room=${encodeURIComponent(roomSlug)}`;
  }, [roomSlug]);

  const hostSignal = useMemo(() => {
    const signals = messages
      .filter((msg) => msg.type === 'meeting_host' && msg.payload?.roomSlug === roomSlug)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return signals[signals.length - 1];
  }, [messages, roomSlug]);

  const lobbySignal = useMemo(() => {
    const signals = messages
      .filter((msg) => msg.type === 'meeting_lobby' && msg.payload?.roomSlug === roomSlug)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return signals[signals.length - 1];
  }, [messages, roomSlug]);

  const recordingSignal = useMemo(() => {
    const signals = messages
      .filter((msg) => msg.type === 'meeting_recording' && msg.payload?.roomSlug === roomSlug)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return signals[signals.length - 1];
  }, [messages, roomSlug]);

  const hostId = hostSignal?.payload?.hostId || null;
  const isHost = hostId ? hostId === currentUser?.id : hostMode;
  const lobbyRequired = lobbySignal?.payload?.enabled ?? lobbyEnabled;
  const recordingActive = recordingSignal?.payload?.action === 'start';

  const approvals = useMemo(() => 
    messages.filter((msg) => msg.type === 'meeting_approved' && msg.payload?.roomSlug === roomSlug),
    [messages, roomSlug]
  );

  const denials = useMemo(() => 
    messages.filter((msg) => msg.type === 'meeting_denied' && msg.payload?.roomSlug === roomSlug),
    [messages, roomSlug]
  );

  const approvedForCurrentUser = approvals.some((msg) => msg.payload?.userId === currentUser?.id);
  const deniedForCurrentUser = denials.some((msg) => msg.payload?.userId === currentUser?.id);

  const pendingRequests = useMemo(() => {
    const approvedIds = new Set(approvals.map((msg) => msg.payload?.userId));
    return messages
      .filter((msg) => msg.type === 'meeting_request' && msg.payload?.roomSlug === roomSlug)
      .filter((msg) => !approvedIds.has(msg.payload?.userId));
  }, [messages, approvals, roomSlug]);

  const ensureLocalStream = useCallback(async () => {
    if (cameraStreamRef.current) return cameraStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getAudioTracks().forEach((track) => track.enabled = !audioMuted);
      stream.getVideoTracks().forEach((track) => track.enabled = !videoMuted);
      cameraStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError('Camera or microphone access is required to join.');
      return null;
    }
  }, [audioMuted, videoMuted]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (!joined && !localStream) {
      ensureLocalStream();
    }
  }, [joined, localStream, ensureLocalStream]);

  useEffect(() => {
    if (!joined && lobbyRequired && approvedForCurrentUser) {
      setJoined(true);
      setError('');
      addToast('Access Granted', 'The host has admitted you to the meeting.', 'success');
    }
  }, [approvedForCurrentUser, lobbyRequired, joined, addToast]);

  useEffect(() => {
    if (deniedForCurrentUser) {
      setError('Your join request was denied by the host.');
      setRequestSent(false);
      addToast('Access Denied', 'The host declined your request.', 'error');
    }
  }, [deniedForCurrentUser, addToast]);

  const updatePeerStream = (peerId, stream, name) => {
    setPeers((prev) => {
      const existing = prev.find((peer) => peer.id === peerId);
      if (existing) {
        return prev.map((peer) => peer.id === peerId ? { ...peer, stream, name: name || peer.name } : peer);
      }
      addToast('User Joined', `${name || 'Someone'} joined the meeting.`);
      return [...prev, { id: peerId, stream, name }];
    });
  };

  const removePeer = (peerId) => {
    const entry = peersRef.current.get(peerId);
    if (entry?.pc) entry.pc.close();
    peersRef.current.delete(peerId);
    setPeers((prev) => {
      const p = prev.find(p => p.id === peerId);
      if (p) addToast('User Left', `${p.name || 'Someone'} left the meeting.`);
      return prev.filter((peer) => peer.id !== peerId);
    });
  };

  const sendSignal = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const createPeerConnection = async (peerId, peerName, isInitiator) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId).pc;
    const local = await ensureLocalStream();
    if (!local) return null;
    
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    local.getTracks().forEach((track) => pc.addTrack(track, local));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'signal', roomId: roomSlug, peerId: peerIdRef.current, targetId: peerId,
          data: { type: 'ice', candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      updatePeerStream(peerId, stream, peerName);
    };

    peersRef.current.set(peerId, { pc, name: peerName });

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({
        type: 'signal', roomId: roomSlug, peerId: peerIdRef.current, targetId: peerId,
        data: { type: 'offer', sdp: offer },
      });
    }
    return pc;
  };

  const handleSignalMessage = async (fromId, data) => {
    if (!data) return;
    if (data.type === 'offer') {
      const pc = await createPeerConnection(fromId, null, false);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({
        type: 'signal', roomId: roomSlug, peerId: peerIdRef.current, targetId: fromId,
        data: { type: 'answer', sdp: answer },
      });
      return;
    }
    if (data.type === 'answer') {
      const entry = peersRef.current.get(fromId);
      if (entry?.pc) await entry.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      return;
    }
    if (data.type === 'ice') {
      const entry = peersRef.current.get(fromId);
      if (entry?.pc && data.candidate) {
        try { await entry.pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch (err) {}
      }
    }
  };

  const connectSocket = () => {
    if (wsRef.current) return;
    const ws = new WebSocket(SIGNALING_URL);
    wsRef.current = ws;
    setConnectionStatus('connecting');

    ws.onopen = () => {
      setConnectionStatus('connected');
      sendSignal({
        type: 'join', roomId: roomSlug, peerId: peerIdRef.current,
        name: displayName || currentUser?.name || 'Guest',
      });
    };

    ws.onmessage = async (event) => {
      let payload;
      try { payload = JSON.parse(event.data); } catch (err) { return; }
      if (!payload) return;

      if (payload.type === 'peers') {
        const peersList = payload.peers || [];
        await Promise.all(peersList.map((peer) => createPeerConnection(peer.id, peer.name, true)));
        return;
      }
      if (payload.type === 'peer-joined') {
        const peer = payload.peer;
        if (peer?.id) await createPeerConnection(peer.id, peer.name, true);
        return;
      }
      if (payload.type === 'peer-left') {
        if (payload.peerId) removePeer(payload.peerId);
        return;
      }
      if (payload.type === 'signal') {
        await handleSignalMessage(payload.fromId, payload.data);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      wsRef.current = null;
    };
  };

  const handleJoin = async () => {
    if (!roomSlug) {
      setError('Enter a meeting name to continue.');
      return;
    }
    if (lobbyRequired && !isHost && !approvedForCurrentUser) {
      setError('This room requires approval. Request access to join.');
      return;
    }

    await ensureLocalStream();
    connectSocket();

    if (isHost) {
      sendSharedMessage('meeting_host', { roomSlug, hostId: currentUser?.id, hostName: currentUser?.name });
      sendSharedMessage('meeting_lobby', { roomSlug, enabled: lobbyRequired, hostId: currentUser?.id });

      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = now.toTimeString().slice(0, 5);
      const alreadyLogged = meetings.some((meeting) => meeting.title === roomSlug && meeting.date === date);
      if (!alreadyLogged) {
        addMeeting(roomSlug, date, time, currentUser?.id ? [currentUser.id] : []);
      }
    }

    setError('');
    setJoined(true);
    addToast('Joined', `You joined ${roomSlug}`, 'success');
  };

  const handleRequestAccess = () => {
    if (!roomSlug) return setError('Enter a meeting name to continue.');
    if (!currentUser?.id) return setError('You must be logged in to request access.');
    sendSharedMessage('meeting_request', { roomSlug, userId: currentUser.id, name: currentUser.name });
    setRequestSent(true);
    setError('');
    addToast('Request Sent', 'Waiting for host approval...', 'default');
  };

  const handleApprove = (request) => {
    if (!request?.payload?.userId) return;
    sendSharedMessage('meeting_approved', {
      roomSlug,
      userId: request.payload.userId,
      name: request.payload.name,
      hostId: currentUser?.id,
    });
  };

  const handleDeny = (request) => {
    if (!request?.payload?.userId) return;
    sendSharedMessage('meeting_denied', {
      roomSlug,
      userId: request.payload.userId,
      name: request.payload.name,
      hostId: currentUser?.id,
    });
  };

  const handleLeave = () => {
    setJoined(false);
    setPeers([]);
    peersRef.current.forEach((entry) => entry.pc?.close());
    peersRef.current.clear();
    if (wsRef.current) {
      sendSignal({ type: 'leave', roomId: roomSlug, peerId: peerIdRef.current });
      wsRef.current.close();
      wsRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setLocalStream(null);
    setScreenSharing(false);
    addToast('Left Meeting', 'You have left the video room.');
  };

  const handleCopy = async () => {
    if (!meetingLink) return;
    try {
      await navigator.clipboard.writeText(meetingLink);
      addToast('Link Copied', 'Meeting link copied to clipboard', 'success');
    } catch (err) {}
  };

  const toggleMute = () => {
    const nextValue = !audioMuted;
    setAudioMuted(nextValue);
    const stream = cameraStreamRef.current || localStream;
    if (stream) stream.getAudioTracks().forEach((track) => track.enabled = !nextValue);
  };

  const toggleVideo = () => {
    const nextValue = !videoMuted;
    setVideoMuted(nextValue);
    const stream = cameraStreamRef.current || localStream;
    if (stream) stream.getVideoTracks().forEach((track) => track.enabled = !nextValue);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = displayStream;
        const screenTrack = displayStream.getVideoTracks()[0];
        Array.from(peersRef.current.values()).forEach((entry) => {
          const sender = entry.pc.getSenders().find((track) => track.track && track.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;
        setScreenSharing(true);
        screenTrack.onended = () => toggleScreenShare();
      } catch (err) {}
      return;
    }

    const cameraStream = cameraStreamRef.current;
    if (cameraStream) {
      const cameraTrack = cameraStream.getVideoTracks()[0];
      Array.from(peersRef.current.values()).forEach((entry) => {
        const sender = entry.pc.getSenders().find((track) => track.track && track.track.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    setScreenSharing(false);
  };

  // Determine grid layout columns based on participants
  const totalParticipants = peers.length + 1; // +1 for local
  let gridCols = "grid-cols-1";
  if (totalParticipants === 2) gridCols = "grid-cols-1 md:grid-cols-2";
  else if (totalParticipants === 3 || totalParticipants === 4) gridCols = "grid-cols-2";
  else if (totalParticipants > 4) gridCols = "grid-cols-2 md:grid-cols-3";

  // Pre-join lobby layout
  if (!joined) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <GlassCard className="w-full max-w-5xl overflow-hidden p-0 border border-white/10 shadow-2xl flex flex-col md:flex-row">
          
          {/* Left Side: Video Preview */}
          <div className="w-full md:w-[60%] p-6 md:p-8 bg-black/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white mb-2 self-start"><GradientText>Ready to join?</GradientText></h1>
            <p className="text-slate-400 self-start mb-6">Set up your audio and video before jumping in.</p>
            
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-white/5 mb-6 group">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover ${videoMuted ? 'hidden' : 'block'} ${!screenSharing && 'scale-x-[-1]'}`}
              />
              {videoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl text-slate-400 font-bold border-2 border-slate-700 shadow-inner">
                    {(displayName || currentUser?.name || 'G').charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={toggleMute} 
                  className={`p-4 rounded-full transition-all ${audioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10'}`}
                >
                  {audioMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button 
                  onClick={toggleVideo} 
                  className={`p-4 rounded-full transition-all ${videoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10'}`}
                >
                  {videoMuted ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
              </div>
            </div>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <ShieldAlert size={16} />
                {error}
              </motion.div>
            )}
          </div>

          {/* Right Side: Meeting Details */}
          <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Meeting Details</h2>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Meeting Code / Name</label>
                <input
                  type="text"
                  placeholder="e.g., weekly-sync"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Display name"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600 focus:bg-white/5"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="pt-4 space-y-3 border-t border-white/10 mt-6">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${hostMode ? 'bg-primary/20 border-primary text-white shadow-inner' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  onClick={() => setHostMode(!hostMode)}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className={hostMode ? 'text-primary-light' : ''} />
                    <span className="font-medium">Host this room</span>
                  </div>
                  {hostMode && <CheckCircle2 size={18} className="text-primary-light" />}
                </button>
                
                <button
                  type="button"
                  disabled={!hostMode && !isHost}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${lobbyEnabled ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-inner' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'} ${(!hostMode && !isHost) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setLobbyEnabled(!lobbyEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className={lobbyEnabled ? 'text-purple-400' : ''} />
                    <span className="font-medium">Require Lobby Approval</span>
                  </div>
                  {lobbyEnabled && <CheckCircle2 size={18} className="text-purple-400" />}
                </button>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex flex-col gap-3">
              {lobbyRequired && !isHost && !approvedForCurrentUser ? (
                <button 
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${requestSent ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-purple-600 hover:scale-[1.02] active:scale-[0.98]'}`}
                  onClick={handleRequestAccess}
                  disabled={requestSent}
                >
                  {requestSent ? 'Request Pending...' : 'Ask to Join'}
                </button>
              ) : (
                <button 
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] active:scale-[0.98] rounded-xl font-bold text-white shadow-lg shadow-green-500/25 transition-all"
                  onClick={handleJoin}
                >
                  Join Meeting
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Active Meeting Layout (Google Meet / Zoom style)
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-200 font-sans">
      
      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10 transition-transform">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/20 transition-colors" onClick={handleCopy}>
            <span className="font-medium text-white">{roomSlug}</span>
            <LinkIcon size={14} className="text-slate-400" />
          </div>
          {recordingActive && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-sm font-semibold animate-pulse">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Recording
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-sm border border-white/20">
            {(displayName || 'Y').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex mt-16 pb-24 overflow-hidden relative">
        
        {/* Video Grid */}
        <div className={`flex-1 p-4 grid gap-4 transition-all duration-300 ${gridCols} ${showSidebar ? 'mr-[320px]' : ''}`}>
          
          {/* Local Video */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl group">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover ${videoMuted ? 'hidden' : 'block'} ${!screenSharing && 'scale-x-[-1]'}`}
            />
            {videoMuted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl text-slate-400 font-bold border border-slate-700">
                  {(displayName || 'Y').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium text-white border border-white/10 flex items-center gap-2">
              {audioMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-green-400" />}
              {displayName || 'You'}
            </div>
          </div>

          {/* Remote Peers */}
          {peers.map((peer) => (
            <div key={peer.id} className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl group">
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={(el) => { if (el && peer.stream) el.srcObject = peer.stream; }}
              />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium text-white border border-white/10 flex items-center gap-2">
                <Mic size={14} className="text-slate-300" />
                {peer.name || 'Guest'}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar (Lobby/Info) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[320px] bg-slate-900/80 backdrop-blur-2xl border-l border-white/10 flex flex-col shadow-2xl z-20"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">Meeting Details</h3>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex border-b border-white/10">
                <button 
                  onClick={() => setActiveTab('people')} 
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'people' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  People ({totalParticipants})
                </button>
                <button 
                  onClick={() => setActiveTab('info')} 
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  Info
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'people' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">In Call</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                              {(displayName || 'Y').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-white">{displayName || 'You'} (You)</span>
                          </div>
                          <div className="flex gap-2">
                            {audioMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-slate-400" />}
                          </div>
                        </div>
                        {peers.map((peer) => (
                          <div key={peer.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
                                {(peer.name || 'G').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm text-white">{peer.name || 'Guest'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isHost && lobbyRequired && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                          Waiting in Lobby
                          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pendingRequests.length}</span>
                        </h4>
                        
                        {pendingRequests.length === 0 ? (
                          <p className="text-sm text-slate-500 italic px-2">No one is waiting.</p>
                        ) : (
                          <div className="space-y-2">
                            {pendingRequests.map((req) => (
                              <div key={req.id} className="p-3 bg-black/40 border border-white/5 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                                    {(req.payload?.name || 'G').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-sm text-white">{req.payload?.name || 'Guest'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleApprove(req)} className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-xs font-semibold transition-colors">Admit</button>
                                  <button onClick={() => handleDeny(req)} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-xs font-semibold transition-colors">Deny</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Joining Link</p>
                      <p className="text-sm font-medium text-primary-light break-all mb-3">{meetingLink}</p>
                      <button onClick={handleCopy} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        <LinkIcon size={14} /> Copy Link
                      </button>
                    </div>
                    
                    {isHost && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                        <h4 className="text-sm font-bold text-white mb-2">Host Controls</h4>
                        
                        <button 
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${lobbyEnabled ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'}`}
                          onClick={() => setLobbyEnabled(!lobbyEnabled)}
                        >
                          <span className="text-sm font-medium">Lobby Approval</span>
                          {lobbyEnabled && <CheckCircle2 size={16} />}
                        </button>

                        <button 
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors border ${recordingActive ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'}`}
                          onClick={() => {
                            const action = recordingActive ? 'stop' : 'start';
                            sendSharedMessage('meeting_recording', { roomSlug, action, by: currentUser?.id, byName: currentUser?.name });
                          }}
                        >
                          <span className="text-sm font-medium">Record Meeting</span>
                          {recordingActive ? <Radio size={16} className="animate-pulse" /> : <Radio size={16} />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-30">
        <button 
          onClick={toggleMute} 
          className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${audioMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 hover:bg-white/20 text-slate-200'}`}
        >
          {audioMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${videoMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 hover:bg-white/20 text-slate-200'}`}
        >
          {videoMuted ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
        
        <div className="w-px h-8 bg-white/10 mx-1" />
        
        <button 
          onClick={toggleScreenShare} 
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${screenSharing ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white/10 hover:bg-white/20 text-slate-200'}`}
          title="Present Screen"
        >
          <MonitorUp size={20} />
        </button>

        <button 
          onClick={() => {
            setActiveTab('people');
            setShowSidebar(!showSidebar);
          }} 
          className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative ${showSidebar ? 'bg-white/20 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-200'}`}
          title="People & Lobby"
        >
          <Users size={20} />
          {isHost && pendingRequests.length > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
          )}
        </button>

        <button 
          onClick={() => {
            setActiveTab('info');
            setShowSidebar(!showSidebar);
          }} 
          className="w-12 h-12 flex items-center justify-center rounded-xl transition-all bg-white/10 hover:bg-white/20 text-slate-200"
          title="Meeting Info"
        >
          <MoreVertical size={20} />
        </button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <button 
          onClick={handleLeave} 
          className="px-6 h-12 flex items-center gap-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <PhoneOff size={18} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}
