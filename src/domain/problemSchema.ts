import { z } from "zod";

export const problemSchema = z.object({
  title: z.string().min(3, "Título muito curto"),
  category: z.string().min(1, "Escolha uma categoria"),
  city: z.string().min(2, "Digite a cidade"),
  neighborhood: z.string().optional(), // 👈 Bairro opcional
  description: z.string().min(5, "Descrição muito curta"),
  latitude: z.number(),
  longitude: z.number(),
  image: z.string().optional(),
});

export type ProblemInput = z.infer<typeof problemSchema>;
