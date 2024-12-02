import * as z from "zod";

export const layerSchema = z.object({
  id: z.string(),
  name: z.string(),
  layer: z.string(),
  network: z.string(),
  currencyId: z.string(),
});

export const currentLayerSchema = z.object({
  id: z.string(),
  layer: z.string(),
  name: z.string(),
  network: z.string(),
  price: z.number(),
  ticker: z.string(),
});

//Layer type
export type LayerSchema = z.infer<typeof layerSchema>;

//Current layer type
export type CurrentLayerSchema = z.infer<typeof currentLayerSchema>;
