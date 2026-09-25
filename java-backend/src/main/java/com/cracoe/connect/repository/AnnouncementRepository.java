package com.cracoe.connect.repository;
import com.cracoe.connect.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, String> {
}
