import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";

/**
 * Generates a Philippine-format plate number (3 letters + 4 digits).
 */
export function generatePlateNumber(): string {
  const letters = faker.string.alpha(3).toUpperCase();
  const numbers = faker.string.numeric(4);
  return `${letters}${numbers}`;
}

/**
 * Gets a random file of the specified type from the documents directory.
 * @param fileType 'image' or 'video' to filter by extension.
 */
export function getRandomFile(fileType: "image" | "video"): string {
  const documentsDir = path.join(__dirname, "..", "..", "documents");
  const allFiles = fs.readdirSync(documentsDir);

  const extensions =
    fileType === "image"
      ? [".jpg", ".jpeg", ".png", ".webp"]
      : [".mp4", ".mov", ".avi"];

  const filteredFiles = allFiles.filter((file) =>
    extensions.includes(path.extname(file).toLowerCase())
  );

  if (filteredFiles.length === 0) {
    throw new Error(`No ${fileType} files found in the 'documents' directory.`);
  }

  const randomFile = faker.helpers.arrayElement(filteredFiles);
  return path.join(documentsDir, randomFile);
}
