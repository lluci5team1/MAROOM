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
    private String brand;
    private String style;
    private String color;
    private Integer price;
    private String roomType;
    private String productUrl;

    public FurnitureItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getProductUrl() { return productUrl; }
    public void setProductUrl(String productUrl) { this.productUrl = productUrl; }
}