import { Howl } from 'howler';
import fileSrc from './assets/audio/fx.mp3';

const audio = {
  init() {
    const handler = () => {
      audio.sprites = new Howl({
        src: [fileSrc],
        sprite: {
          rail: [0, 3000],
          snow: [4500, 2000],
          clang: [8000, 500],
          table: [12000, 3000]
        },
        onload() {
          audio.playbackIds.snow = audio.sprites.play('snow');
          audio.sprites.loop(true, audio.playbackIds.snow);
          audio.sprites.volume(0.1, audio.playbackIds.snow);
        }
      });
      window.removeEventListener('keydown', handler);
    };
    window.addEventListener('keydown', handler);
  },
  sprites: null,
  playbackIds: {
    rail: 0,
    snow: 0,
    clang: 0,
    table: 0
  },
  play(name) {
    if (!audio.sprites) return;
    audio.playbackIds[name] = audio.sprites.play(name);
  },
  stop(name) {
    if (!audio.sprites) return;
    audio.sprites.stop(audio.playbackIds[name]);
  },
  setVolume(name, volume) {
    if (!audio.sprites) return;
    audio.sprites.volume(volume, audio.playbackIds[name]);
  }
};

module.exports = audio;
