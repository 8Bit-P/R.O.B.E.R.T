import { calibrateStepper, driveStepperToAngle, setAPIAcceleration, setAPIVelocity, toggleStepperState } from '../api/commands';

interface ParsedInstruction {
  command: string;
  params: string[];
}

export const parseFile = (file: File): Promise<ParsedInstruction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // On file load, parse the content
    reader.onload = () => {
      const fileContent = reader.result as string;
      const lines = fileContent.split('\n');
      const instructions: ParsedInstruction[] = [];

      // Regex patterns to match the commands and capture parameters after the '>'
      const moveRegex = /^MOVE>(.*)$/;
      const toggleRegex = /^TOGGLE>(.*)$/;
      const calibrateRegex = /^CALIBRATE>(.*)$/;
      const setVelRegex = /^SETVEL>(.*)$/;
      const setAccRegex = /^SETACC>(.*)$/;

      lines.forEach((line) => {
        line = line.trim();

        if (line === '' || line.startsWith('//')) {
          return; // Ignore empty lines and comments
        }

        // Match against the different command types
        let match: RegExpExecArray | null;

        if ((match = moveRegex.exec(line))) {
          instructions.push({ command: 'MOVE', params: match[1].split(';').map((param) => param.trim()) });
        } else if ((match = toggleRegex.exec(line))) {
          instructions.push({ command: 'TOGGLE', params: match[1].split(';').map((param) => param.trim()) });
        } else if ((match = calibrateRegex.exec(line))) {
          instructions.push({ command: 'CALIBRATE', params: match[1].split(';').map((param) => param.trim()) });
        } else if ((match = setVelRegex.exec(line))) {
          instructions.push({ command: 'SETVEL', params: [match[1].trim()] });
        } else if ((match = setAccRegex.exec(line))) {
          instructions.push({ command: 'SETACC', params: [match[1].trim()] });
        } else {
          reject(new Error(`Invalid command: ${line}`));
        }
      });

      resolve(instructions);
    };

    // Handle errors
    reader.onerror = () => {
      reject(new Error('Error reading the file'));
    };

    // Start reading the file as text
    reader.readAsText(file);
  });
};

const executeInstruction = async (instruction: ParsedInstruction) => {
  switch (instruction.command) {
    case 'MOVE':
      const jointsAngles = new Map<number, number>();
      instruction.params.forEach((param) => {
        const [joint, angle] = param.split('_');
        jointsAngles.set(parseInt(joint.replace('J', '')), parseInt(angle));
      });
      await driveStepperToAngle(jointsAngles);
      break;

    case 'TOGGLE':
      instruction.params.forEach(async (param) => {
        const [joint, state] = param.split('_');
        await toggleStepperState(parseInt(joint.replace('J', '')), state);
      });
      break;

    case 'CALIBRATE':
      const jointsToCalibrate = instruction.params.map((param) => parseInt(param.replace('J', '')));
      await calibrateStepper(jointsToCalibrate);
      break;

    case 'SETVEL':
      await setAPIVelocity(Number(instruction.params[0]));
      break;

    case 'SETACC':
      await setAPIAcceleration(Number(instruction.params[0]));
      break;

    default:
      throw new Error(`Unknown command: ${instruction.command}`);
  }
};

export const generateFunctionStack = (instructions: ParsedInstruction[]) => {
  const functionStack: (() => Promise<void>)[] = [];
  instructions.forEach((instruction) => {
    functionStack.push(async () => {
      await executeInstruction(instruction);
    });
  });
  return functionStack;
};

export const highlightKeywords = (line: string) => {
  // Define a list of keywords and their respective colors
  const keywords = [
    { keyword: 'MOVE>', color: 'text-blue-500' },
    { keyword: 'TOGGLE>', color: 'text-green-500' },
    { keyword: 'CALIBRATE>', color: 'text-purple-500' },
    { keyword: 'SETVEL>', color: 'text-orange-500' },
    { keyword: 'SETACC>', color: 'text-yellow-500' },
  ];

  // Replace each keyword in the line with a colored span
  keywords.forEach(({ keyword, color }) => {
    const keywordRegex = new RegExp(`(${keyword})`, 'g');
    line = line.replace(keywordRegex, `<span class="${color}">$1</span>`);
  });

  return line;
};
