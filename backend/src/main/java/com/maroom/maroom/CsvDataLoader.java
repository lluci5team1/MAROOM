package com.maroom.maroom;

import com.maroom.maroom.domain.FurnitureItem;
import com.maroom.maroom.repository.FurnitureItemRepository;
import com.maroom.maroom.service.FurnitureEmbeddingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class CsvDataLoader implements CommandLineRunner {

    private final FurnitureItemRepository repo;
    private final FurnitureEmbeddingService furnitureEmbeddingService;

    public CsvDataLoader(FurnitureItemRepository repo,
                         FurnitureEmbeddingService furnitureEmbeddingService) {
        this.repo = repo;
        this.furnitureEmbeddingService = furnitureEmbeddingService;
    }

    @Override
    public void run(String... args) throws Exception {

        if (repo.count() > 0) {
            return;
        }

        ClassPathResource resource =
                new ClassPathResource("data/MAROOM_Furniture_Database.csv");

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;

            reader.readLine();

            while ((line = reader.readLine()) != null) {

                String[] cols = parse(line);

                FurnitureItem item = new FurnitureItem();

                item.setTitle(clean(cols[0]));
                item.setCategory(clean(cols[1]));
                item.setBrand(clean(cols[2]));
                item.setStyle(clean(cols[3]));
                item.setColor(clean(cols[4]));
                item.setPrice(parsePrice(cols[5]));
                item.setRoomType(clean(cols[6]));
                item.setProductUrl(clean(cols[7]));
                item.setImageUrl(clean(cols[8]));

                FurnitureItem savedItem = repo.save(item);
                furnitureEmbeddingService.embedFurniture(savedItem);
            }
        }
    }

    private String[] parse(String line) {
        return line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)", -1);
    }

    private String clean(String v) {
        if (v == null) return null;

        v = v.trim();

        if (v.startsWith("\"") && v.endsWith("\"")) {
            v = v.substring(1, v.length() - 1);
        }

        if (v.isEmpty()) return null;

        return v;
    }

    private Integer parsePrice(String v) {

        v = clean(v);

        if (v == null) return null;

        v = v.replace("$", "").replace(",", "");

        try {
            return (int) Double.parseDouble(v);
        } catch (Exception e) {
            return null;
        }
    }
}
