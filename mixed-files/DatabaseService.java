package com.example.service;

import javax.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DatabaseService {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public void saveEntity(Object entity) {
        entityManager.persist(entity);
    }
    
    public <T> T findById(Class<T> entityClass, Long id) {
        return entityManager.find(entityClass, id);
    }
    
    public void executeQuery(String sql) {
        Query query = entityManager.createNativeQuery(sql);
        query.executeUpdate();
    }
}