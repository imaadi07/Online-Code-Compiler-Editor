// Multi-Language Configurations & Project Starter Trees

export const SUPPORTED_LANGUAGES = [
  {
    id: "python",
    name: "Python 3",
    monacoLang: "python",
    extension: ".py",
    icon: "🐍",
    defaultEntry: "main.py",
    description: "Python 3.10 runtime for algorithms, data processing, and scripting.",
    initialFiles: [
      {
        id: "py-main",
        name: "main.py",
        type: "file",
        path: "main.py",
        isEntry: true,
        content: `# Python 3 Multi-File Project
from utils.helpers import calculate_greeting

def main():
    print(calculate_greeting("Developer"))
    print("Execution completed successfully.")

if __name__ == "__main__":
    main()
`,
      },
      {
        id: "py-folder-utils",
        name: "utils",
        type: "folder",
        path: "utils",
        isOpen: true,
        children: [
          {
            id: "py-helpers",
            name: "helpers.py",
            type: "file",
            path: "utils/helpers.py",
            content: `# Helper routines
def calculate_greeting(name: str) -> str:
    return f"Hello, {name}! Welcome to CodeCraft Multi-File Workspace."
`,
          },
        ],
      },
    ],
  },
  {
    id: "java",
    name: "Java 17",
    monacoLang: "java",
    extension: ".java",
    icon: "☕",
    defaultEntry: "Main.java",
    description: "OpenJDK 17 runtime for object-oriented systems and data structures.",
    initialFiles: [
      {
        id: "java-main",
        name: "Main.java",
        type: "file",
        path: "Main.java",
        isEntry: true,
        content: `// Java 17 Multi-File Workspace
import models.GreetingService;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        GreetingService service = new GreetingService();
        System.out.println(service.getMessage("Developer"));

        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            System.out.println("Received Input: " + scanner.nextLine());
        }
        scanner.close();
    }
}
`,
      },
      {
        id: "java-folder-models",
        name: "models",
        type: "folder",
        path: "models",
        isOpen: true,
        children: [
          {
            id: "java-greeting",
            name: "GreetingService.java",
            type: "file",
            path: "models/GreetingService.java",
            content: `package models;

public class GreetingService {
    public String getMessage(String user) {
        return "Hello from GreetingService, " + user + "!";
    }
}
`,
          },
        ],
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    monacoLang: "javascript",
    extension: ".js",
    icon: "📜",
    defaultEntry: "index.js",
    description: "Node.js 18 runtime with standard libraries and module exports.",
    initialFiles: [
      {
        id: "js-index",
        name: "index.js",
        type: "file",
        path: "index.js",
        isEntry: true,
        content: `// Node.js Multi-File Workspace
const { add, formatOutput } = require("./lib/math");

function main() {
  const sum = add(20, 22);
  console.log(formatOutput("Sum of 20 and 22", sum));
}

main();
`,
      },
      {
        id: "js-folder-lib",
        name: "lib",
        type: "folder",
        path: "lib",
        isOpen: true,
        children: [
          {
            id: "js-math",
            name: "math.js",
            type: "file",
            path: "lib/math.js",
            content: `// Math module
function add(a, b) {
  return a + b;
}

function formatOutput(label, value) {
  return \`[MathResult] \${label}: \${value}\`;
}

module.exports = { add, formatOutput };
`,
          },
        ],
      },
    ],
  },
  {
    id: "cpp",
    name: "C++ (g++)",
    monacoLang: "cpp",
    extension: ".cpp",
    icon: "⚙️",
    defaultEntry: "main.cpp",
    description: "Modern C++ compiled with g++ -O2 with STL support.",
    initialFiles: [
      {
        id: "cpp-main",
        name: "main.cpp",
        type: "file",
        path: "main.cpp",
        isEntry: true,
        content: `// C++ 17 Multi-File Workspace
#include <iostream>
#include "include/utils.h"

int main() {
    std::cout << "Starting C++ execution..." << std::endl;
    printGreeting("Developer");
    return 0;
}
`,
      },
      {
        id: "cpp-folder-include",
        name: "include",
        type: "folder",
        path: "include",
        isOpen: true,
        children: [
          {
            id: "cpp-utils-h",
            name: "utils.h",
            type: "file",
            path: "include/utils.h",
            content: `#ifndef UTILS_H
#define UTILS_H

#include <iostream>
#include <string>

inline void printGreeting(const std::string& name) {
    std::cout << "Hello, " << name << "! C++ Multi-File build successful." << std::endl;
}

#endif
`,
          },
        ],
      },
    ],
  },
  {
    id: "c",
    name: "C (gcc)",
    monacoLang: "c",
    extension: ".c",
    icon: "🔬",
    defaultEntry: "main.c",
    description: "C11 compiled with gcc -O2 standard runtime.",
    initialFiles: [
      {
        id: "c-main",
        name: "main.c",
        type: "file",
        path: "main.c",
        isEntry: true,
        content: `// C11 Multi-File Workspace
#include <stdio.h>
#include "include/math_utils.h"

int main() {
    printf("C Runner initialized.\\n");
    int result = multiply(6, 7);
    printf("Result of 6 * 7 = %d\\n", result);
    return 0;
}
`,
      },
      {
        id: "c-folder-include",
        name: "include",
        type: "folder",
        path: "include",
        isOpen: true,
        children: [
          {
            id: "c-math-h",
            name: "math_utils.h",
            type: "file",
            path: "include/math_utils.h",
            content: `#ifndef MATH_UTILS_H
#define MATH_UTILS_H

static inline int multiply(int a, int b) {
    return a * b;
}

#endif
`,
          },
        ],
      },
    ],
  },
];

// Map language ID to initial project file tree
export const INITIAL_PROJECT_FILES = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
  acc[lang.id] = lang.initialFiles;
  return acc;
}, {});

// Helper to determine Monaco language from file extension
export const getMonacoLanguage = (fileName) => {
  if (!fileName) return "plaintext";
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "py":
      return "python";
    case "java":
      return "java";
    case "js":
    case "jsx":
      return "javascript";
    case "cpp":
    case "cc":
    case "hpp":
    case "h":
      return "cpp";
    case "c":
      return "c";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "txt":
      return "plaintext";
    default:
      return "plaintext";
  }
};

// Helper to extract file icon
export const getFileIcon = (fileName) => {
  if (!fileName) return "📄";
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "py":
      return "🐍";
    case "java":
      return "☕";
    case "js":
      return "📜";
    case "cpp":
    case "cc":
    case "c":
    case "h":
    case "hpp":
      return "⚙️";
    case "json":
      return "📦";
    case "md":
      return "📝";
    default:
      return "📄";
  }
};

export const FONT_SIZES = [12, 13, 14, 16, 18];
