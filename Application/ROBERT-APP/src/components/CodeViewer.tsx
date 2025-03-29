import React, { useEffect, useState } from 'react';
import { FaPlay, FaStepForward } from 'react-icons/fa'; // Importing icons
import { executeInstruction, highlightKeywords, ParsedInstruction, parseFile } from '../Utils/ScriptParserUtils';
import toast from 'react-hot-toast';

interface CodeViewerProps {
  file: File | null; // Pass a File object
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [fileContent, setFileContent] = useState<string>(''); // State to store file content
  const [currentLine, setCurrentLine] = useState<number>(0); // Track the current line being executed
  const [isRunningLine, setIsRunningLine] = useState<boolean>(false); // Track if the script is running

  const [parsedInstructionStack, setParsedInstructionStack] = useState<ParsedInstruction[]>([]);

  const lines = fileContent.split('\n'); // Split content into lines

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

    parseFile(file)
      .then((res) => {
        setParsedInstructionStack(res);
        setCurrentLine(0);
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }, [file]);

  const runAllScript = async () => {
    setCurrentLine(0); // Reset current line to 0

    for (let line = 0; line < parsedInstructionStack.length; line++) {
      try {
        await runLine(line); // Wait for each line to finish before proceeding
      } catch (error) {
        toast.error(String(error));
        setCurrentLine(0);
        return; // Stop execution on error
      }
    }
    toast.success('Script finished!');
  };

  const runLine = async (lineNumber: number): Promise<void> => {
    setIsRunningLine(true);

    if (lineNumber >= parsedInstructionStack.length) {
      toast.success('Script finished!');
      setCurrentLine(0);
      return;
    }

    try {
      await executeInstruction(parsedInstructionStack[lineNumber]); // Wait for execution to finish
      setCurrentLine((prevLineCount) => prevLineCount + 1);
    } catch (error) {
      toast.error(String(error));
      setCurrentLine(0);
      throw error; // Rethrow error to stop execution in `runAllScript`
    } finally {
      setIsRunningLine(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-gray-900 text-white rounded-lg p-4 shadow-lg overflow-auto max-h-80vh border border-gray-700">
      {/* Buttons for running the script */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={runAllScript}
          disabled={isRunningLine}
          style={{ fontFamily: 'nothing' }}
          className={`flex items-center px-4 py-2 rounded-md transition 
                    ${isRunningLine ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
        >
          <FaPlay className="mr-2" />
          Run Script
        </button>

        <button
          onClick={() => runLine(currentLine)}
          disabled={isRunningLine}
          style={{ fontFamily: 'nothing' }}
          className={`flex items-center px-4 py-2 rounded-md transition 
                      ${isRunningLine ? 'bg-red-500 text-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          <FaStepForward className="mr-2" />
          Run Current Line
        </button>
      </div>

      <pre className="p-4 text-sm">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`flex ${currentLine === index ? 'bg-red-500' : ''}`} // Highlight current line being executed
          >
            {/* Line number */}
            <span className="text-gray-500 pr-4 w-10 text-right">{index + 1}</span>
            {/* Code line with highlighted keywords */}
            <span className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightKeywords(line) }}></span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default CodeViewer;
