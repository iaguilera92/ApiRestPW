import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    reporters: [
        "default",
        ["jest-junit", {
            outputDirectory: "./test-results",
            outputName: "junit.xml",
            classNameTemplate: "{classname}",
            titleTemplate: "{title}",
            ancestorSeparator: " > ",
            includeConsoleOutput: true,
        }],
    ],
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: {
                types: ["node", "jest"],
                module: "Node16",
                moduleResolution: "Node16",
                esModuleInterop: true,
                strict: true,
                isolatedModules: true,
            },
        }],
    },
};

export default config;
