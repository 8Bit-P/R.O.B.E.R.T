import React, { useEffect, useState } from "react";
import { FaPlay, FaStepForward } from "react-icons/fa"; // Importing icons
import { highlightKeywords } from "../Utils/ScriptParserUtils";

interface CodeViewerProps {
  file: File | null; // Pass a File object
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [fileContent, setFileContent] = useState<string>(""); // State to store file content
  const [currentLine, setCurrentLine] = useState<number | null>(null); // Track the current line being executed

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    
    // When file is loaded, set content
    reader.onload = () => {
      const content = reader.result as string;
      setFileContent(content); // Set file content to state
    };

    // Read the file as text
    reader.readAsText(file);
  }, [file]);

  const lines = fileContent.split("\n"); // Split content into lines

  const runAllScript = () => {
    // Logic for running the whole script
    console.log("Running the whole script...");
    // Simulate running the whole script (for demonstration)
    lines.forEach((line, index) => {
      setTimeout(() => {
        console.log(`Running Line ${index + 1}: ${line}`);
      }, index * 500); // Running lines with delay
    });
  };

  const runLine = (lineNumber: number) => {
    // Logic for running an individual line
    console.log(`Running Line ${lineNumber + 1}: ${lines[lineNumber]}`);
    setCurrentLine(lineNumber); // Set the current line being run
  };

  return (
    <div className="w-full max-w-3xl bg-gray-900 text-white rounded-lg p-4 shadow-lg overflow-auto max-h-80vh border border-gray-700">
      {/* Buttons for running the script */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={runAllScript}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
        >
          <FaPlay className="mr-2" />
          Run Script
        </button>
        <button
          onClick={() => runLine(currentLine !== null ? currentLine : 0)} // Running the current line
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          <FaStepForward className="mr-2" />
          Run Current Line
        </button>
      </div>

      <pre className="p-4 text-sm">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`flex ${currentLine === index ? "bg-red-500" : ""}`} // Highlight current line being executed
          >
            {/* Line number */}
            <span className="text-gray-500 pr-4 w-10 text-right">{index + 1}</span>
            {/* Code line with highlighted keywords */}
            <span
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(line) }}
            ></span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeViewer;
