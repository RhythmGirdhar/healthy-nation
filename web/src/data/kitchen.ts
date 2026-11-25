import "server-only";
import { z } from "zod";
import content from "../../content/kitchen-photos.json";
import { isLocalImage } from "@/lib/domain-validation";

export const kitchenPhotos = z.array(z.strictObject({
  id: z.string().regex(/^kitchen-\d{3}$/),
  src: z.string().refine(isLocalImage, "Use a local photo under /images"),
  alt: z.string().trim().min(1),
  category: z.string().trim().min(1),
  width: z.int().positive(),
  height: z.int().positive(),
})).parse(content);
