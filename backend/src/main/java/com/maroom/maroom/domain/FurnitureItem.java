package com.maroom.maroom.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "furniture_items")
public class FurnitureItem {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    private String title;
    private String category;
    private String style;
    private Integer price;

    public FurnitureItem() {}

    public UUID getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
}