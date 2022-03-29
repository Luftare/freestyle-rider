import { Howl } from "howler";
import fileSrc from "url:../assets/audio/fx.mp3";

const audio = {
  sprites: null,
  playbackIds: {
    rail: 0,
    snow: 0,
    clang: 0,
    table: 0,
  },
  init() {
    return new Promise((resolve) => {
      const initializationEvents = ["touchstart", "keydown", "mousedown"];
      const firstInteractionHandler = () => {
        audio.sprites = new Howl({
          src: [fileSrc],
          sprite: {
            rail: [0, 3000],
            snow: [4500, 2000],
            clang: [8000, 500],
            snowLanding: [10000, 1500],
            table: [12000, 3000],
            wind: [17000, 2000],
          },
          onload() {
            resolve(audio);
          },
        });

        initializationEvents.forEach((name) => {
          window.removeEventListener(name, firstInteractionHandler);
        });
      };

      initializationEvents.forEach((name) => {
        window.addEventListener(name, firstInteractionHandler);
      });
    });
  },
  startAmbientSounds() {
    audio.playbackIds.snow = audio.sprites.play("snow");
    audio.playbackIds.wind = audio.sprites.play("wind");
    audio.sprites.loop(true, audio.playbackIds.snow);
    audio.sprites.volume(0.1, audio.playbackIds.snow);
    audio.sprites.loop(true, audio.playbackIds.wind);
    audio.sprites.volume(0.1, audio.playbackIds.wind);
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
  },
};

module.exports = audio;
