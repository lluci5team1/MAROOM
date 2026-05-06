package com.maroom.maroom.controller;

import com.maroom.maroom.service.FurnitureImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/furniture/import")
@CrossOrigin
public class FurnitureImportController {

    private final FurnitureImportService furnitureImportService;

    public FurnitureImportController(FurnitureImportService furnitureImportService) {
        this.furnitureImportService = furnitureImportService;
    }

    @PostMapping("/large")
    public ResponseEntity<String> importLargeDataset() {
        int savedCount = furnitureImportService.importLargeDataset();

        return ResponseEntity.ok("Imported " + savedCount + " furniture items.");
    }
}