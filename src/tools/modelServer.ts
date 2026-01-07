import { MentalModelData } from "../models/interfaces.js";
import { mentalModelDataSchema } from '../schemas/model.js';
import { ZodError } from 'zod';
import chalk from "chalk";

export class ModelServer {
    private validateModelData(input: unknown): MentalModelData {
        try {
            return mentalModelDataSchema.parse(input);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                throw new Error(`Invalid model data: ${errorMessages}`);
            }
            throw error;
        }
    }

    private formatModelOutput(data: MentalModelData): string {
        const { modelName, problem, steps, reasoning, conclusion } = data;

        let output = `\n${chalk.bold.blue("Mental Model:")} ${chalk.bold(
            modelName
        )}\n`;
        output += `${chalk.bold.green("Problem:")} ${problem}\n`;

        if (steps && steps.length > 0) {
            output += `\n${chalk.bold.yellow("Steps:")}\n`;
            steps?.forEach((step, index) => {
                output += `${chalk.bold(`${index + 1}.`)} ${step}\n`;
            });
        }

        if (reasoning) {
            output += `\n${chalk.bold.magenta("Reasoning:")}\n${reasoning}\n`;
        }

        if (conclusion) {
            output += `\n${chalk.bold.cyan("Conclusion:")}\n${conclusion}\n`;
        }

        return output;
    }

    public processModel(input: unknown): any {
        try {
            const validatedInput = this.validateModelData(input);
            const formattedOutput = this.formatModelOutput(validatedInput);
            console.error(formattedOutput);

            return {
                modelName: validatedInput.modelName,
                status: "success",
                hasSteps: validatedInput.steps || [].length > 0,
                hasConclusion: !!validatedInput.conclusion,
            };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : String(error),
                status: "failed",
            };
        }
    }
}
