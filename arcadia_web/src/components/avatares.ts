export interface Avatar {
  nombre: string;
  lineas: string[];
}

export const AVATARES: Avatar[] = [
  { nombre: "robot", lineas: [" _[___]_ ", " | o o | ", " |  =  | ", " |_____| ", "  /| |\\ "] },
  { nombre: "calavera", lineas: ["  .---.  ", " / o o \\ ", " \\  ^  / ", "  |VVV|  "] },
  { nombre: "gato", lineas: [" /\\_/\\ ", "( o.o )", " > ^ < "] },
  { nombre: "ojo", lineas: [" .-----. ", "/  (@)  \\", "'-.___.-'"] },
  { nombre: "anonimo", lineas: [" .-----. ", " |() ()| ", " | \\_/ | ", "  '---'  "] },
];