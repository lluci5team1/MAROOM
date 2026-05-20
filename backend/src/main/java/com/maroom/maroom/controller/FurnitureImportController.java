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
    public ResponseEntity<FurnitureImportService.ImportResult> importLargeDataset(
            @RequestParam(defaultValue = "50") int queryLimit,
            @RequestParam(defaultValue = "false") boolean embed,
            @RequestParam(defaultValue = "true") boolean random
    ) {
        return ResponseEntity.ok(furnitureImportService.importLargeDataset(queryLimit, embed, random));
    }

    @PostMapping("/serpapi")
    public ResponseEntity<FurnitureImportService.ImportResult> importFromSerpApi(
            @RequestParam(defaultValue = "50") int queryLimit,
            @RequestParam(defaultValue = "false") boolean embed,
            @RequestParam(defaultValue = "true") boolean random
    ) {
        return ResponseEntity.ok(furnitureImportService.importLargeDataset(queryLimit, embed, random));
    }
}
