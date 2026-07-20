import { EffectComposer, Bloom } from '@react-three/postprocessing';

export function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.8}
        mipmapBlur
      />
    </EffectComposer>
  );
}
export default PostFX;
