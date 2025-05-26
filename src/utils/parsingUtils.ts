export const parseAIResponse = (responseText: string): { description: string | null, output: string | null, success: boolean, error?: string } => {
  const responseRegex = /<description>(.*?)<\/description>\s*<output>(.*?)<\/output>/s;
  const match = responseText.match(responseRegex);

  if (match && match[1] !== undefined && match[2] !== undefined) {
    const description = match[1].trim();
    const output = match[2].trim(); // Output will be cleaned by cleanTextOutput in App.tsx

    if (description === "" && output === "") {
        // Technically valid parsing, but might indicate an issue or empty response from AI
        return { 
            description: "", 
            output: "", 
            success: true 
        };
    }
    
    return { 
      description: description, 
      output: output, 
      success: true 
    };
  } else {
    return { 
      description: null, 
      output: null, 
      success: false, 
      error: "Failed to parse AI response: Missing <description> or <output> tags, or invalid format." 
    };
  }
};
