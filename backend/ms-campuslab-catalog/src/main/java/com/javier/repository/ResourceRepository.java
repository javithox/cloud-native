package com.javier.repository;

import com.javier.model.Resource;
import com.javier.model.ResourceType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Resource> findLockedById(Long id);
    Optional<Resource> findByCode(String code);
    List<Resource> findByTypeAndActiveTrue(ResourceType type);
    List<Resource> findByActiveTrue();
}
