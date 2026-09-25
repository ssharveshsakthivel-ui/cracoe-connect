package com.cracoe.connect.repository;
import com.cracoe.connect.entity.ScheduleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ScheduleItemRepository extends JpaRepository<ScheduleItem, String> {
}
