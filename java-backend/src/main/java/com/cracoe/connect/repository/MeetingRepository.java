package com.cracoe.connect.repository;
import com.cracoe.connect.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface MeetingRepository extends JpaRepository<Meeting, String> {
}
