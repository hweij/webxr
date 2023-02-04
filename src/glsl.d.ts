// This enables us to import glsl files in the TypeScript code
declare module '*.glsl?raw' {
  const value: string;
  export default value;
}
declare module '*.frag?raw' {
  const value: string;
  export default value;
}
declare module '*.vert?raw' {
  const value: string;
  export default value;
}
