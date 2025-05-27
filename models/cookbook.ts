import { Recipe } from "./recipe";

export type Cookbook = {
    userid: string;
    recipes: Recipe[];
};

export const createCookbook = (userid: string, recipes: Recipe[] = []): Cookbook => {
    return {
        userid,
        recipes,
    };
};