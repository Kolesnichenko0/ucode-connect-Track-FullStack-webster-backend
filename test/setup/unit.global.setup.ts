// test/unit.global.setup.ts
import {loadEnvironment} from './global.setup';

export default async (): Promise<void> => {
    loadEnvironment();
}
