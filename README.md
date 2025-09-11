# R.O.B.E.R.T 🤖  
*A 6-DOF robotic arm powered by Arduino + steppers, with a Tauri desktop app interface*  

![robot-arm](https://img.shields.io/badge/Robotics-6DOF-blue?style=for-the-badge)  
![arduino](https://img.shields.io/badge/Arduino-Mega-orange?style=for-the-badge)  
![rust-tauri](https://img.shields.io/badge/Tauri-Rust%20+%20React-black?style=for-the-badge)  

---

## 📖 About the Project  

Meet **R.O.B.E.R.T.**, my DIY 6-DOF robotic arm project (currently running with 5 joints, gripper coming soon).  
It combines **hardware, electronics, and custom software** to create a full ecosystem for controlling a robotic arm.  

The project has three main parts:  

1. **Robotic Arm** – 3D printed + stepper motors for precise movements.  
2. **Electronics Box** – Arduino Mega 2560, RAMPS board, motor drivers, and power supply.  
3. **Desktop App** – Built with Tauri (Rust + React + Tailwind), it provides a clean UI to command the arm over a serial connection.  

---

## 🛠 Hardware  

The robotic arm has 6 joints, each powered by stepper motors. A gripper can be added to the end of J6 for more control. 

Electronics box components:  
- ⚡ Power supply (200W)  
- 🌀 TB6600 stepper motor driver for stepper 1
- 🧠 Arduino Mega 2560 + RAMPS board to manage steppers 2 to 6  
- 🎛️ Custom 3D-printed front panel for connectors
- 🔌 On/off switch + power input  

Each joint (except J6) has a **limit switch** for homing and preventing over-rotation.  
The overall build is made using a 3d printer for most of the parts of the robot, a bunch of nuts and bolts of different m-sizes, bearings and aluminum tube for structure. 

---

## 💻 Software  

The PC communicates with the Arduino via **serial connection**, structured into three abstraction layers:  

1️⃣ **Arduino firmware**  
   - Interprets serial commands  
   - Handles stepper movement, calibration, velocity, and acceleration  

2️⃣ **Desktop App (Tauri)**  
   - UI: React + TailwindCSS + TypeScript  
   - Backend: Rust  
   - Minimalist design (inspired by *Nothing* + Bento grids)  
   - Clean interface for controlling movements without raw commands  

3️⃣ **Custom Instruction Set**  
   - Works like a simplified programming language  
   - Interpreted line by line  
   - Can script movements (e.g., move multiple joints at once, set speeds, calibrate)  

👉 Full ecosystem: **Arduino firmware → Desktop app → Instruction set scripting**  

---

## ⚙️ Technologies  

**Frontend**  
- ReactJS  
- TailwindCSS  
- TypeScript  
- Vite  

**Backend**  
- Tauri (Rust)  

---

## 🚀 Running the Project  

Clone the repo and install dependencies:  

```bash
git clone https://github.com/8Bit-P/R.O.B.E.R.T.git
cd R.O.B.E.R.T/Application/ROBERT-APP
npm install
```

Run the Tauri app locally:
```bash
npm run tauri dev
```

> ⚠️ Make sure [Tauri is set up](https://tauri.app/v1/guides/getting-started/prerequisites) on your system.  

---

## ⌨️ Commands (Arduino Firmware)  

All commands end with `~` for quicker parsing.  

Examples:  

```markdown
//Move command, moves one or more joints a fixed amount of steps
MOVE>JOINT_NSTEPS;
MOVE>J1_100;
MOVE>J1_-200;J2_300;

//Toggle command, enables or disables a stepper
TOGGLE>JOINT_STATE;
TOGGLE>J1_ENABLED;
TOGGLE>J2_DISABLED;J2_ENABLED;

//Connect command, returns a string if the CONNECTED if the connection was successful
CONNECT>

//Calibrate command, homes all steppers to position '0'
CALIBRATE>J1; 
CALIBRATE>J1;J2; 

//Set velocity of steppers
SETVEL>80; // 0-1000 range 

//Set acceleration of steppers
SETACC>10; // 0-1000 range

//Returns state of all steppers
//example: [STATE];J1_DISABLED;J2_ENABLED;J3_ENABLED;J4_ENABLED;J5_ENABLED;J6_ENABLED
STATE> 

//Returns tracked steps of all steppers
//example: [STEPS];J1_300;J2_UNKNOWN;J3_UNKNOWN;J4_UNKNOWN;J5_UNKNOWN;J6_UNKNOWN
STEPS>

//Returns the calibration state of each stepper
//example: [STATE];J1_0;J2_1;J3_0;J4_1;J5_1;J6_1;
CALSTATE>

//Returns the velocity and acceleration of the steppers
//example: [PARAMS];VEL_20;ACC_40;
PARAMS>//Move command, moves one or more joints a fixed amount of steps
MOVE>JOINT_NSTEPS;
MOVE>J1_100;
MOVE>J1_-200;J2_300;

//Toggle command, enables or disables a stepper
TOGGLE>JOINT_STATE;
TOGGLE>J1_ENABLED;
TOGGLE>J2_DISABLED;J2_ENABLED;

//Connect command, returns a string if the CONNECTED if the connection was successful
CONNECT>

//Calibrate command, homes all steppers to position '0'
CALIBRATE>J1; 
CALIBRATE>J1;J2; 

//Set velocity of steppers
SETVEL>80; // 0-1000 range 

//Set acceleration of steppers
SETACC>10; // 0-1000 range

//Returns state of all steppers
//example: [STATE];J1_DISABLED;J2_ENABLED;J3_ENABLED;J4_ENABLED;J5_ENABLED;J6_ENABLED
STATE> 

//Returns tracked steps of all steppers
//example: [STEPS];J1_300;J2_UNKNOWN;J3_UNKNOWN;J4_UNKNOWN;J5_UNKNOWN;J6_UNKNOWN
STEPS>

//Returns the calibration state of each stepper
//example: [STATE];J1_0;J2_1;J3_0;J4_1;J5_1;J6_1;
CALSTATE>

//Returns the velocity and acceleration of the steppers
//example: [PARAMS];VEL_20;ACC_40;
PARAMS>
```

## ⌨️ Reduced Scripting Command Set

Used in the desktop app to give a set of instructions to reproduce for the arm.

```markdown
//Move command, moves one or more joints to a certain angle
MOVE>JOINT_ANGLE;
MOVE>J1_45;
MOVE>J1_90;J2_20;

//Toggle command, enables or disables a stepper
TOGGLE>JOINT_STATE;
TOGGLE>J1_ENABLED;
TOGGLE>J2_DISABLED;J2_ENABLED;

//Calibrate command, homes all steppers to position '0'
CALIBRATE>J1; 
CALIBRATE>J1;J2;J3;J4;J5;J6; 

//Set velocity of steppers
SETVEL>80; // 0-100 range 

//Set acceleration of steppers
SETACC>10; // 0-100 range

```

## 📜 License  

GNU License – feel free to fork, adapt, and improve!  