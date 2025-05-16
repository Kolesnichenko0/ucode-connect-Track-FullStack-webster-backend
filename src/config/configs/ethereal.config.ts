// src/config/configs/ethereal.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const EtherealSchema = z.object({
    ETHEREAL_HOST: z.string().default('smtp.ethereal.email'),
    ETHEREAL_PORT: z.coerce.number().default(587),
    ETHEREAL_USER: z.string().optional(),
    ETHEREAL_PASS: z.string().optional(),
    GOOGLE_USE_GMAIL: z.preprocess((val) => val === 'true', z.boolean()).default(true),
}).refine(data => {
    if (!data.GOOGLE_USE_GMAIL) {
        return data.ETHEREAL_USER !== undefined && data.ETHEREAL_PASS !== undefined;
    }
    return true;
}, {
    message: "ETHEREAL_USER and ETHEREAL_PASS are required when GOOGLE_USE_GMAIL is false",
    path: ["ETHEREAL_USER", "ETHEREAL_PASS"],
});

export type IEtherealConfig = ReturnType<typeof getEtherealConfig>;

const getEtherealConfig = () => {
    const config = ConfigValidator.validate(process.env, EtherealSchema) as z.infer<typeof EtherealSchema>;

    return {
        ethereal: {
            host: config.ETHEREAL_HOST,
            port: config.ETHEREAL_PORT,
            user: config.ETHEREAL_USER || '',
            password: config.ETHEREAL_PASS || '',
        },
    };
};

export default getEtherealConfig;
