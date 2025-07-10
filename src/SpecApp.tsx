// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import * as Tone from 'tone';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// --- Global Constants and Helper Functions ---

// Helper function to play a simple synth sound
const playSound = (frequency, type = 'sine', duration = '8n', volume = -10) => {
  if (Tone.context.state !== 'running') {
    Tone.start();
  }
  const synth = new Tone.Synth({
    oscillator: { type: type },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.05,
      release: 0.2,
    },
  }).toDestination();
  synth.triggerAttackRelease(frequency, duration);
  synth.volume.value = volume;
};

// --- SVG Icons (for consistency and no external deps) ---
const LumonLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#e0e8ff] opacity-70">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 mr-2 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Workflow Action Icons (repurposed from temper bins) - These are for the MDR game
const HeartBrokenIcon = (props) => (
  <svg {...props} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="heart-broken" className="svg-inline--fa fa-heart-broken w-[1em] h-[1em]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4C506.7 262.1 512 209.1 487.8 160.2c-24.5-56.1-84.8-93.5-151.7-93.5h-52.6c-45.3 0-89 17.5-121.6 48.8C126.7 141.4 109 178.6 109 217.3c0 14.1 2.7 27.7 7.6 40.3L47.6 300.4zm183.1 77.2c-5.8-5.3-9.1-12.7-9.1-20.9V204.3c0-8.2 3.3-15.6 9.1-20.9l2.8-2.6 1.8-1.7 1.8-1.7 2.8-2.6 2.8-2.6 1.8-1.7 1.8-1.7 2.8-2.6c5.8-5.3 12.7-8.2 20.3-8.2s14.5 2.9 20.3 8.2l2.8 2.6 1.8 1.7 1.8 1.7 2.8 2.6 2.8 2.6 1.8 1.7 1.8 1.7 2.8 2.6c5.8 5.3 9.1 12.7 9.1 20.9v152.4c0 8.2-3.3 15.6-9.1 20.9L256 424l-25.3-23.4z"/>
  </svg>
);

const LaughBeamIcon = (props) => (
  <svg {...props} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="laugh-beam" className="svg-inline--fa fa-laugh-beam w-[1em] h-[1em]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM357.5 329.1c-22.3 22.3-51.5 34.6-83.5 34.6s-61.2-12.4-83.5-34.6c-13.4-13.4-35.1-13.4-48.5 0s-13.4 35.1 0 48.5c30.2 30.2 70.3 46.8 113.1 46.8s82.9-16.7 113.1-46.8c13.4-13.4 13.4-35.1 0-48.5s-35.1-13.4-48.5 0zM196.4 138.8c-15.1 0-27.4 12.3-27.4 27.4s12.3 27.4 27.4 27.4c15.1 0 27.4-12.3 27.4-27.4s-12.3-27.4-27.4-27.4zM315.6 138.8c-15.1 0-27.4 12.3-27.4 27.4s12.3 27.4 27.4 27.4c15.1 0 27.4-12.3 27.4-27.4s-12.3-27.4-27.4-27.4z"/>
  </svg>
);

const SkullCrossbonesIcon = (props) => (
  <svg {...props} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="skull-crossbones" className="svg-inline--fa fa-skull-crossbones w-[1em] h-[1em]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm144 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM174.5 130.2c-5.7-3.9-13.6-4.5-19.9-1.9L108 147.2l-37.5 15C53.7 168.3 48 178.6 48 189.6V256c0 10.9 5.7 21.2 14.5 25.4L108 300.8l37.5 15c6.3 2.6 14.2 2 19.9-1.9s9.5-10.7 9.5-17.6V147.9c0-6.9-3.8-13.7-9.5-17.6zM390 147.2l-46.5-19c-6.3-2.6-14.2-2-19.9 1.9s-9.5 10.7-9.5 17.6v152.1c0 6.9 3.8 13.7 9.5 17.6s13.6 4.5 19.9 1.9L404 300.8l37.5-15c8.8-4.2 14.5-14.5 14.5-25.4V189.6c0-10.9-5.7-21.2-14.5-25.4L404 147.2zM240 288c0-17.7 14.3-32 32-32s32 14.3 32 32c0 30.5-20.9 56.1-49.8 62.4c-3.1 .7-6.2 1.6-9.2 2.7l-9.2 3.2c-6.6 2.3-13.4 3.7-20.1 4.2C226.7 359.8 208 340.5 208 318.9V288z"/>
  </svg>
);

const BoltIcon = (props) => (
  <svg {...props} aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bolt" className="svg-inline--fa fa-bolt w-[1em] h-[1em]" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <path fill="currentColor" d="M152.1 405.7L225.8 206.4H116.2C101.4 206.4 92.5 190.2 100.9 177.8L233.7 5.6C240.2-3.3 254.4-1.2 259.9 8.2L378.7 211.7c6.1 10.4 4.1 23.9-5.1 32.4L188.7 483.5c-7.9 7.4-19.7 7.4-27.6 0L152.1 405.7z"/>
  </svg>
);

// New Icons for Airline Domains
const OperationsIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);
const CrewIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-4 0c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-4 0c-1.66 0-3 1.34-3 3s1.34 3 3 3zm8 8H4v-2c0-2.21 3.58-4 8-4s8 1.79 8 4v2z"/>
  </svg>
);
const FlightIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9L2 14v2l8-2v5l-1.5 1.5L10 22l3.5-1.5L15 22l-1.5-1.5V16l8 2z"/>
  </svg>
);
const InFlightIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 9v4H6V9H4v6h16V9h-2z"/>
  </svg>
);
const AirportIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 18v-1c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-4V3c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2v1H0v2h24v-2h-4zm-6-16h-4v2h4V2zm-8 4h12v10H4V6z"/>
  </svg>
);
const TrainingIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L1 9l11 6 11-6-11-6zm0 10.98L4.5 9 12 5.02 19.5 9 12 13.98zM5 15v4h14v-4H5z"/>
  </svg>
);


// Tool Icons (reused from previous version)
const DataToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
  </svg>
);
const ModelToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22h20zm0 3.84L18.73 20H5.27z"/>
  </svg>
);
const CodeToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8V5l-7 7 7 7v-3h4v-8zM14 16v3l7-7-7-7v3h-4v8z"/>
  </svg>
);
const CiCdToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2h-4v2h4V4zm6 16H4V8h16v12zM9 10h6v2H9zm0 4h6v2H9z"/>
  </svg>
);
const BugToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 8c0-3.31-2.69-6-6-6s-6 2.69-6 6h2c0-2.21 1.79-4 4-4s4 1.79 4 4v2H7v-2H5v2c-2.21 0-4 1.79-4 4s1.79 4 4 4v2h14v-2c2.21 0 4-1.79 4-4s-1.79-4-4-4zm-2 6H7v-2h10v2z"/>
  </svg>
);
const FeedbackToolIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);
const WafflePartyIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 8-8-8H4v12h16V6z"/>
  </svg>
);
const FingerTrapIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);
const MdeIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);
const LumonHeadIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);


// --- Core UI Components ---

// CRTWrapper component
const CRTWrapper = ({ children }) => {
  return (
    <div className="relative w-full h-full bg-[#1a234a] overflow-hidden font-vt323 text-[#e0e8ff]">
      <div className="absolute inset-0 z-10 pointer-events-none scanlines opacity-30"></div>
      <div className="absolute inset-0 z-20 pointer-events-none vignette opacity-50"></div>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-vt323 { font-family: 'VT323', monospace; }
        .scanlines {
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 1px,
            rgba(0, 0, 0, 0.2) 2px,
            rgba(0, 0, 0, 0.2) 3px
          );
        }
        .vignette {
          box-shadow: inset 0px 0px 100px 30px rgba(0,0,0,0.7);
        }
        .crt-glow {
          text-shadow: 0 0 5px #e0e8ff, 0 0 10px #e0e8ff;
          filter: drop-shadow(0 0 3px #e0e8ff);
        }
        .crt-container {
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(0.98);
          border-radius: 1.5rem;
          box-shadow: 0 0 50px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.2);
          animation: flicker 0.2s infinite alternate;
        }
        @keyframes flicker {
          0% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.98; filter: brightness(0.98); }
          100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 3px #e0e8ff); }
          50% { filter: drop-shadow(0 0 8px #e0e8ff); }
          100% { filter: drop-shadow(0 0 3px #e0e8ff); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 1.5s infinite alternate;
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2);
        }
        .text-shadow-glow {
          text-shadow: 0 0 8px rgba(251, 191, 36, 0.8), 0 0 16px rgba(251, 191, 36, 0.4);
        }
        `}
      </style>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full bg-black overflow-hidden
                        flex flex-col items-center justify-center crt-container transition-all duration-500">
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm opacity-50 z-0"
            style={{ backgroundImage: `url(https://placehold.co/1920x1080/000000/FFFFFF?text=Coforge+Agentic+AI)` }}
          ></div>
          <div className="relative z-10 w-full h-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Intro Animation Component
const IntroAnimation = ({ onAnimationComplete }) => {
  const mountRef = useRef(null);
  const animationFrameId = useRef(null);
  const stateRef = useRef({ phase: 0, startTime: Date.now(), courseIndex: 0, cardFlipStartTime: 0 });

  const scene = useRef(new THREE.Scene());
  const camera = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000));
  const renderer = useRef(null);
  const ellipseGroup = useRef(new THREE.Group());
  const globe = useRef(null);
  const rolodexGroup = useRef(new THREE.Group());
  const currentCard = useRef(null);

  const COURSE_TITLES = [
    "Intro to LLMs", "Computer Vision", "Data Ethics & AI",
    "Reinforcement Learning", "Neural Networks Basics", "Advanced ML Algorithms",
    "Generative AI", "AI for Robotics",
  ];

  const initThree = useCallback(() => {
    if (!mountRef.current) return;

    renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.current.domElement);

    camera.current.position.set(0, 0, 5);
    camera.current.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040, 5);
    scene.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(0, 0, 1);
    scene.current.add(directionalLight);

    const material = new THREE.LineBasicMaterial({ color: 0xe0e8ff, linewidth: 2 });
    const createEllipse = (radiusX, radiusY) => {
      const curve = new THREE.EllipseCurve(0, 0, radiusX, radiusY, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.LineLoop(geometry, material);
    };

    const ellipse1 = createEllipse(0.3, 0.5);
    const ellipse2 = createEllipse(0.5, 0.3);
    const ellipse3 = createEllipse(0.4, 0.4);
    ellipse1.rotation.z = Math.PI / 4;
    ellipse2.rotation.z = -Math.PI / 4;

    ellipseGroup.current.add(ellipse1, ellipse2, ellipse3);
    ellipseGroup.current.position.set(0, 0, 0);
    scene.current.add(ellipseGroup.current);

    const globeGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    globe.current = new THREE.LineSegments(new THREE.EdgesGeometry(globeGeometry), material);
    globe.current.visible = false;

    rolodexGroup.current = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.2);
    const rolodexMaterial = new THREE.MeshBasicMaterial({ color: 0xe0e8ff, wireframe: true });
    const rolodexBox = new THREE.Mesh(boxGeometry, rolodexMaterial);
    rolodexGroup.current.add(rolodexBox);
    rolodexGroup.current.visible = false;
    scene.current.add(rolodexGroup.current);

    const handleResize = () => {
      if (mountRef.current && renderer.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const aspect = width / height;

        camera.current.left = -aspect;
        camera.current.right = aspect;
        camera.current.top = 1;
        camera.current.bottom = -1;
        camera.current.updateProjectionMatrix();
        renderer.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
  }, []);

  const animate = useCallback(() => {
    const totalElapsedTime = Date.now() - stateRef.current.startTime;

    if (stateRef.current.phase === 0) {
      const duration = 3000; // slowed down for better visibility
      const progress = Math.min(totalElapsedTime / duration, 1);

      ellipseGroup.current.children.forEach((el, i) => {
        el.rotation.x = Math.sin(progress * Math.PI * 2 + i * 0.5) * 0.2;
        el.rotation.y = Math.cos(progress * Math.PI * 2 + i * 0.7) * 0.2;
        el.scale.setScalar(1 - progress * 0.5);
      });

      if (progress >= 0.5 && !globe.current.visible) {
        globe.current.visible = true;
        scene.current.add(globe.current);
        playSound(440, 'sine', '16n');
      }
      if (globe.current.visible) {
        globe.current.material.opacity = progress;
        globe.current.material.transparent = true;
        globe.current.scale.setScalar(progress * 2);
        ellipseGroup.current.visible = progress < 1;
      }

      if (progress >= 1) {
        stateRef.current.phase = 1;
        stateRef.current.startTime = Date.now();
        stateRef.current.cardFlipStartTime = Date.now();
        ellipseGroup.current.visible = false;
        globe.current.visible = true;
        rolodexGroup.current.visible = true;
      }
    } else if (stateRef.current.phase === 1) {
      const durationPerCard = 1000; // slower card flip
      const phaseElapsedTime = Date.now() - stateRef.current.startTime;

      globe.current.rotation.y += 0.01;

      const currentCardIndex = Math.floor(phaseElapsedTime / durationPerCard);

      if (currentCardIndex < COURSE_TITLES.length) {
        if (currentCardIndex !== stateRef.current.courseIndex) {
          stateRef.current.courseIndex = currentCardIndex;
          stateRef.current.cardFlipStartTime = Date.now();
          playSound(220, 'square', '32n', -15);

          if (currentCard.current) {
            rolodexGroup.current.remove(currentCard.current);
            currentCard.current.geometry.dispose();
            currentCard.current.material.dispose();
            currentCard.current = null;
          }

          const text = COURSE_TITLES[currentCardIndex];
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 512;
          canvas.height = 128;
          context.fillStyle = 'black';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.font = 'bold 48px VT323';
          context.fillStyle = '#e0e8ff';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, canvas.width / 2, canvas.height / 2);

          const texture = new THREE.CanvasTexture(canvas);
          const cardMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0 });
          const cardGeometry = new THREE.PlaneGeometry(1.1, 0.4);
          currentCard.current = new THREE.Mesh(cardGeometry, cardMaterial);
          currentCard.current.position.set(0, 0.05, 0.1);
          rolodexGroup.current.add(currentCard.current);
        }

        if (currentCard.current) {
            const currentCardFlipElapsed = Date.now() - stateRef.current.cardFlipStartTime;
            const cardFlipAnimationDuration = 300;
            const cardFlipProgressLocal = Math.min(currentCardFlipElapsed / cardFlipAnimationDuration, 1);

            const easedProgress = 1 - Math.pow(1 - cardFlipProgressLocal, 2);
            currentCard.current.rotation.x = (1 - easedProgress) * (-Math.PI / 2);
            currentCard.current.material.opacity = easedProgress;
        }
      } else {
        stateRef.current.phase = 2;
        stateRef.current.startTime = Date.now();
        playSound(880, 'sine', '16n');
      }
    } else if (stateRef.current.phase === 2) {
      const duration = 2000; // slower fade out
      const progress = Math.min(totalElapsedTime / duration, 1);

      rolodexGroup.current.scale.setScalar(1 - progress);
      rolodexGroup.current.rotation.y += 0.05;

      globe.current.scale.setScalar(1 - progress);
      globe.current.material.opacity = 1 - progress;
      globe.current.rotation.y += 0.05;

      if (progress >= 1) {
        cancelAnimationFrame(animationFrameId.current);
        onAnimationComplete();
        return;
      }
    }

    renderer.current.render(scene.current, camera.current);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [onAnimationComplete, COURSE_TITLES]);

  useEffect(() => {
    initThree();
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (renderer.current && mountRef.current && mountRef.current.contains(renderer.current.domElement)) {
        mountRef.current.removeChild(renderer.current.domElement);
        renderer.current.dispose();
      }
      window.removeEventListener('resize', () => {});
    };
  }, [initThree, animate]);

  return (
    <div ref={mountRef} className="absolute inset-0 z-50 flex items-center justify-center bg-black">
      <div className="absolute text-center text-white text-xl crt-glow animate-pulse-glow">
        <SpinnerIcon /> Loading Coforge Operating System...
      </div>
    </div>
  );
};

// MessageBox component
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-800' : 'bg-green-800';
  const borderColor = type === 'error' ? 'border-red-600' : 'border-green-600';
  const textColor = 'text-[#e0e8ff]';

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100]">
      <div className={`p-6 rounded-lg border-2 ${borderColor} ${bgColor} crt-glow text-center min-w-[300px] max-w-sm`}>
        <p className={`text-2xl mb-4 ${textColor}`}>{message}</p>
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-md bg-[#e0e8ff] text-[#1a234a] font-bold text-xl hover:bg-white transition-colors duration-200`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Lumon Messaging System
const LumonMessage = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] p-8 bg-[#0a0f2b] border-2 border-yellow-400 rounded-lg text-center shadow-lg shadow-yellow-400/30">
      <p className="text-3xl text-yellow-400 mb-4 glow-text">Transmission from Coforge</p>
      <p className="text-2xl text-[#e0e8ff] mb-6">{message}</p>
      <button
        onClick={onDismiss}
        className="px-6 py-2 rounded-md bg-[#e0e8ff] text-[#1a234a] font-bold text-xl hover:bg-white transition-colors duration-200"
      >
        Acknowledge
      </button>
    </div>
  );
};

// The Break Room Component
const BreakRoom = ({ onAcknowledge }) => {
  const [acknowledgementCount, setAcknowledgementCount] = useState(0);
  const [currentLine, setCurrentLine] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const typeSpeed = 50; // Milliseconds per character

  const lines = [
    "I am a good person.",
    "I am a smart person.",
    "I am a loyal person."
  ];

  useEffect(() => {
    if (lineIndex < lines.length) {
      let charIndex = 0;
      setCurrentLine('');
      const typingInterval = setInterval(() => {
        setCurrentLine((prev) => prev + lines[lineIndex].charAt(charIndex));
        charIndex++;
        if (charIndex === lines[lineIndex].length) {
          clearInterval(typingInterval);
          setTimeout(() => {
            setLineIndex((prev) => prev + 1);
          }, 1000); // Pause before next line
        }
      }, typeSpeed);
      return () => clearInterval(typingInterval);
    }
  }, [lineIndex]);

  const handleAcknowledge = () => {
    playSound(150, 'triangle', '32n', -10);
    setAcknowledgementCount(prev => prev + 1);
    if (acknowledgementCount + 1 >= 3) { // Require 3 acknowledgements
      onAcknowledge();
    }
  };

  return (
    <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center bg-black bg-opacity-90 p-8 text-center crt-glow">
      <h2 className="text-5xl text-red-500 mb-8 animate-pulse-glow">BREACH OF CONDUCT</h2>
      <p className="text-3xl text-[#e0e8ff] mb-12">Proceed with acknowledgement:</p>
      <div className="bg-[#0a0f2b] p-8 rounded-lg border-2 border-red-600 mb-12 min-h-[150px] flex items-center justify-center w-full max-w-xl">
        <p className="text-4xl text-red-400 whitespace-pre-wrap">{currentLine}</p>
      </div>
      {lineIndex >= lines.length && (
        <button
          onClick={handleAcknowledge}
          className="px-8 py-3 rounded-md bg-red-600 text-white font-bold text-2xl hover:bg-red-700 transition-colors duration-200"
        >
          Acknowledge ({acknowledgementCount} / 3)
        </button>
      )}
    </div>
  );
};

// The MDR Number Refinement Game Component
const MDRGame = ({ onGameComplete, onGameFail, currentFile, setCurrentFile }) => {
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const endPos = useRef({ x: 0, y: 0 });
    const scrollOffset = useRef(0);
    const [numbersData, setNumbersData] = useState([]);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const totalScaryNumbers = useRef(0);
    const maxScroll = (Math.ceil(numbersData.length / 20) * 40) - 400;

    const MOCK_FILES_MDR = [
      {
        fileName: 'Dranesville Macrodata',
        numbers: [
          { id: 1, value: 87, temper: null }, { id: 2, value: 11, temper: 'WO' }, { id: 3, value: 34, temper: 'WO' },
          { id: 4, value: 56, temper: null }, { id: 5, value: 92, temper: 'DR' }, { id: 6, value: 5, temper: 'DR' },
          { id: 7, value: 78, temper: null }, { id: 8, value: 23, temper: 'FR' }, { id: 9, value: 67, temper: null },
          { id: 10, value: 45, temper: 'MA' }, { id: 11, value: 12, temper: 'MA' }, { id: 12, value: 9, temper: 'WO' },
          { id: 13, value: 88, temper: null }, { id: 14, value: 1, temper: 'DR' }, { id: 15, value: 42, temper: null },
          { id: 16, value: 7, temper: 'FR' }, { id: 17, value: 33, temper: 'FR' }, { id: 18, value: 50, temper: null },
          { id: 19, value: 61, temper: 'MA' }, { id: 20, value: 28, temper: null }, { id: 21, value: 19, temper: 'WO' },
          { id: 22, value: 72, temper: null }, { id: 23, value: 8, temper: 'DR' }, { id: 24, value: 15, temper: 'DR' },
          { id: 25, value: 32, temper: 'MA' }, { id: 26, value: 59, temper: null }, { id: 27, value: 99, temper: 'WO' },
          { id: 28, value: 13, temper: 'FR' }, { id: 29, value: 48, temper: null }, { id: 30, value: 75, temper: 'FR' },
          { id: 31, value: 6, temper: null }, { id: 32, value: 25, temper: 'MA' }, { id: 33, value: 81, temper: 'DR' },
          { id: 34, value: 30, temper: 'WO' }, { id: 35, value: 4, temper: 'FR' }, { id: 36, value: 95, temper: null },
          ...Array.from({ length: 200 }).map((_, i) => ({ // Reduced for slightly faster completion
            id: 37 + i,
            value: Math.floor(Math.random() * 100),
            temper: Math.random() < 0.15 ? ['WO', 'FR', 'DR', 'MA'][Math.floor(Math.random() * 4)] : null,
          })),
        ],
      },
    ];

    useEffect(() => {
        setCurrentFile(MOCK_FILES_MDR[0]);
        setNumbersData(MOCK_FILES_MDR[0].numbers);
        totalScaryNumbers.current = MOCK_FILES_MDR[0].numbers.filter(n => n.temper !== null).length;
        setProgress(0);
        setMessage('');
    }, [setCurrentFile]);


    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const gridSize = 40;
        const cols = Math.floor(canvas.width / gridSize);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const visibleNumbers = numbersData.filter(n => n.value !== -1); // Filter out refined numbers
        const currentNumberPositions = [];

        ctx.font = `${gridSize * 0.6}px 'VT323'`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const renderStartRow = Math.max(0, Math.floor(scrollOffset.current / gridSize));
        const renderEndRow = renderStartRow + Math.ceil(canvas.height / gridSize) + 2;

        for (let i = 0; i < visibleNumbers.length; i++) {
            const num = visibleNumbers[i];
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = col * gridSize + gridSize / 2;
            const y = row * gridSize + gridSize / 2 - scrollOffset.current;

            if (y + gridSize / 2 > 0 && y - gridSize / 2 < canvas.height) { // Only draw if visible
                currentNumberPositions.push({
                    id: num.id,
                    value: num.value,
                    temper: num.temper,
                    x: col * gridSize,
                    y: row * gridSize - scrollOffset.current,
                    width: gridSize,
                    height: gridSize,
                    isScary: num.temper !== null,
                });

                const isSelected = selectedNumbers.some(sNum => sNum.id === num.id);
                const baseColor = isSelected ? '#ffffff' : '#e0e8ff';
                const flicker = Math.random() > 0.95 ? (Math.random() * 0.1 - 0.05) : 0;
                ctx.fillStyle = `rgba(${parseInt(baseColor.slice(1, 3), 16) + flicker * 255}, ${parseInt(baseColor.slice(3, 5), 16) + flicker * 255}, ${parseInt(baseColor.slice(5, 7), 16) + flicker * 255}, ${1 - Math.random() * 0.05})`;
                ctx.shadowColor = baseColor;
                ctx.shadowBlur = isSelected ? 15 : (Math.random() > 0.9 ? 10 : 3);

                ctx.fillText(String(num.value).padStart(2, '0'), x, y);
            }
        }
        // Update numberPositions ref after filtering and positioning
        currentNumberPositions.current = currentNumberPositions;

        if (drawing.current) {
            const rectX = Math.min(startPos.current.x, endPos.current.x);
            const rectY = Math.min(startPos.current.y, endPos.current.y);
            const rectWidth = Math.abs(startPos.current.x - endPos.current.x);
            const rectHeight = Math.abs(startPos.current.y - endPos.current.y);

            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            ctx.setLineDash([]);
        }

        animationFrameId.current = requestAnimationFrame(draw);
    }, [numbersData, selectedNumbers, scrollOffset]); // Removed currentNumberPositions from deps

    const animationFrameId = useRef(null); // Ref for animation frame ID

    const getCanvasMousePos = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = useCallback((e) => {
      drawing.current = true;
      const pos = getCanvasMousePos(e);
      startPos.current = { x: pos.x, y: pos.y };
      endPos.current = { x: pos.x, y: pos.x }; // Initialize endPos to startPos to draw a dot
      setSelectedNumbers([]); // Clear previous selection on new drag start
    }, [setSelectedNumbers]);

    const handleMouseMove = useCallback((e) => {
      if (!drawing.current) return;
      endPos.current = getCanvasMousePos(e);
    }, []);

    const handleMouseUp = useCallback(() => {
        drawing.current = false;
        const rectX = Math.min(startPos.current.x, endPos.current.x);
        const rectY = Math.min(startPos.current.y, endPos.current.y);
        const rectWidth = Math.abs(startPos.current.x - endPos.current.x);
        const rectHeight = Math.abs(startPos.current.y - endPos.current.y);

        const selected = currentNumberPositions.current.filter(numPos => { // Use the ref directly
            return numPos.x < rectX + rectWidth &&
                   numPos.x + numPos.width > rectX &&
                   numPos.y < rectY + rectHeight &&
                   numPos.y + numPos.height > rectY;
        });
        setSelectedNumbers(selected);
        startPos.current = { x: 0, y: 0 };
        endPos.current = { x: 0, y: 0 };
    }, [setSelectedNumbers]);


    const handleWheel = useCallback((e) => {
        const newScrollOffset = scrollOffset.current + e.deltaY;
        scrollOffset.current = Math.max(0, Math.min(newScrollOffset, maxScroll));
        // Force a re-render or re-draw here if needed, but requestAnimationFrame should handle it
    }, [maxScroll]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            canvas.getContext('2d').scale(dpr, dpr);

            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('wheel', handleWheel);

            animationFrameId.current = requestAnimationFrame(draw);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousedown', handleMouseDown);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseup', handleMouseUp);
                canvas.removeEventListener('wheel', handleWheel);
            }
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, draw]);

    useEffect(() => {
        const remainingScary = numbersData.filter(n => n.temper !== null).length;
        const newProgress = totalScaryNumbers.current > 0
            ? Math.floor(((totalScaryNumbers.current - remainingScary) / totalScaryNumbers.current) * 100)
            : 0;
        setProgress(newProgress);

        if (newProgress >= 100 && totalScaryNumbers.current > 0) {
            setMessage('FILE COMPLETED. EXCELLENT WORKER.');
            setMessageType('info');
            playSound(880, 'square', '16n', 0);
            setTimeout(() => onGameComplete(true), 2000); // Signal completion to parent
        } else if (newProgress < 100 && totalScaryNumbers.current > 0 && numbersData.length > 0 && Math.random() < 0.005) {
            // Small chance of failure if not done, to trigger Break Room
            if (newProgress < 50) { // Only fail if less than 50% complete
                setMessage('IRREGULARITY DETECTED. IMMEDIATE SANCTION REQUIRED.');
                setMessageType('error');
                playSound(100, 'sawtooth', '16n', -5);
                setTimeout(() => onGameFail(), 2000);
            }
        }
    }, [numbersData, onGameComplete, onGameFail]);

    const closeMessage = () => setMessage('');

    const handleBinClick = useCallback((temperType) => {
        if (selectedNumbers.length === 0) {
            setMessage('SELECT NUMBERS TO REFINE.');
            setMessageType('error');
            playSound(100, 'sawtooth', '16n', -5);
            return;
        }

        const allCorrect = selectedNumbers.every(num => num.temper === temperType);
        const hasScaryNumbers = selectedNumbers.some(num => num.temper !== null); // Ensure at least one scary number

        if (allCorrect && hasScaryNumbers) {
            setNumbersData(prevNumbers =>
                prevNumbers.map(num =>
                    selectedNumbers.some(sNum => sNum.id === num.id)
                        ? { ...num, temper: null, value: -1 } // Mark as refined
                        : num
                )
            );
            setSelectedNumbers([]);
            setMessage('REFINE GOOD. GOOD REFINEMENT.');
            setMessageType('info');
            playSound(600, 'sine', '32n');
        } else {
            setSelectedNumbers([]);
            setMessage('INCORRECT CATEGORIZATION. RECALIBRATE.');
            setMessageType('error');
            playSound(100, 'sawtooth', '16n', -5);
            // Trigger a potential break room visit or penalty here
            if (Math.random() < 0.2) { // 20% chance to trigger break room on incorrect categorization
                onGameFail();
            }
        }
    }, [selectedNumbers, numbersData, onGameFail]);


    return (
        <div className="flex flex-col h-full w-full p-4">
            <MessageBox message={message} type={messageType} onClose={closeMessage} />

            <div className="flex justify-between items-center w-full pb-2 mb-4 border-b-2 border-[#e0e8ff] crt-glow">
                <span className="text-xl md:text-2xl">{currentFile.fileName}</span>
                <div className="flex-1 mx-4 h-4 bg-[#0a0f2b] border border-[#e0e8ff] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#e0e8ff] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span className="text-xl md:text-2xl mr-4">{progress}%</span>
                <LumonLogo />
            </div>

            <div className="flex-1 flex flex-col md:flex-row w-full gap-4">
                <div className="flex-1 h-[calc(100%-150px)] md:h-full min-h-[300px] md:min-h-0 flex-shrink-0">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair border-2 border-[#e0e8ff] crt-glow"
                        style={{ imageRendering: 'pixelated', WebkitFontSmoothing: 'none', MozOsxFontSmoothing: 'none' }}
                    ></canvas>
                </div>

                <div className="w-full md:w-48 flex flex-row md:flex-col justify-around items-center md:items-stretch gap-4 md:gap-2 pt-4 md:pt-0 pb-2">
                    {['WO', 'FR', 'DR', 'MA'].map(temper => (
                        <div
                            key={temper}
                            onClick={() => handleBinClick(temper)}
                            className="flex-1 flex flex-col items-center justify-center p-2 rounded-lg border-2 border-[#e0e8ff] crt-glow cursor-pointer
                                       hover:bg-[#0a0f2b] transition-colors duration-200 aspect-square md:aspect-auto min-w-[70px] min-h-[70px]"
                        >
                            {temper === 'WO' && <HeartBrokenIcon className="text-3xl mb-1" />}
                            {temper === 'FR' && <LaughBeamIcon className="text-3xl mb-1" />}
                            {temper === 'DR' && <SkullCrossbonesIcon className="text-3xl mb-1" />}
                            {temper === 'MA' && <BoltIcon className="text-3xl mb-1" />}
                            <span className="text-xl md:text-2xl">{temper}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Perks System ---
const PerksDisplay = ({ perks }) => {
  return (
    <div className="p-4 bg-[#0a0f2b] border-2 border-[#e0e8ff] rounded-lg crt-glow mt-4">
      <h3 className="text-xl text-yellow-400 mb-3 text-center glow-text">Incentives Program</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {perks.map(perk => (
          <div key={perk.id} className="flex items-center gap-2">
            {perk.id === 'waffle_party' && <WafflePartyIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
            {perk.id === 'finger_trap' && <FingerTrapIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
            {perk.id === 'mde' && <MdeIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
            <span className={perk.unlocked ? 'text-white' : 'text-gray-600 line-through'}>{perk.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Employee Directory Component ---
const EmployeeDirectory = ({ currentEmployee }) => {
  const employees = [
    { id: 'mark', name: 'Mark S.', status: 'Active', role: 'Macrodata Refinement', icon: <LumonHeadIcon/> },
    { id: 'helen', name: 'Helena E.', status: 'Active', role: 'Macrodata Refinement', icon: <LumonHeadIcon/> },
    { id: 'dylan', name: 'Dylan G.', status: 'Active', role: 'Macrodata Refinement', icon: <LumonHeadIcon/> },
    { id: 'irving', name: 'Irving B.', status: 'Active', role: 'Macrodata Refinement', icon: <LumonHeadIcon/> },
    { id: 'oandd', name: 'Burt G.', status: 'Active', role: 'Optics & Design', icon: <LumonHeadIcon/> },
    { id: 'oandd2', name: 'Felicia G.', status: 'Active', role: 'Optics & Design', icon: <LumonHeadIcon/> },
    { id: 'mgr', name: 'Patricia C.', status: 'Active', role: 'Department Chief', icon: <LumonHeadIcon/> },
  ];

  return (
    <div className="p-4 bg-[#0a0f2b] border-2 border-[#e0e8ff] rounded-lg crt-glow mt-4 overflow-auto max-h-48">
      <h3 className="text-xl text-yellow-400 mb-3 text-center glow-text">Employee Directory</h3>
      <ul className="text-sm">
        {employees.map(emp => (
          <li key={emp.id} className="flex items-center gap-2 py-1 border-b border-[#1f2d5a] last:border-b-0">
            {emp.icon}
            <span>{emp.name} ({emp.role})</span>
            <span className={`ml-auto text-xs ${emp.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
              {emp.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Music Dance Experience Component (simple placeholder)
const MusicDanceExperience = ({ onComplete }) => {
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    // Initialize Tone.js context if not already running
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    // Create a simple synth for the MDE "music"
    playerRef.current = new Tone.MembraneSynth().toDestination();
    playerRef.current.volume.value = -15; // Keep it subtle

    // Set up audio analysis for visualizer
    audioContextRef.current = Tone.context.rawContext;
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    bufferLengthRef.current = analyserRef.current.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

    // Connect Tone.js master output to the analyser
    Tone.getDestination().connect(analyserRef.current);

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (Tone.getDestination()._output && analyserRef.current) {
        // Ensure analyser is disconnected if it was connected
        try {
          Tone.getDestination()._output.disconnect(analyserRef.current);
        } catch (e) {
          console.warn("Could not disconnect analyser during cleanup:", e);
        }
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, []);

  const startMusic = useCallback(() => {
    if (!playing) {
      setPlaying(true);
      // Simple beat
      new Tone.Loop(time => {
        playerRef.current.triggerAttackRelease("C2", "8n", time);
        playerRef.current.triggerAttackRelease("E2", "16n", time + Tone.Time("8n").toSeconds()); // Fixed typo here
      }, "4n").start(0);
      Tone.Transport.start();
      drawVisualizer();
    }
  }, [playing]);

  const stopMusic = useCallback(() => {
    setPlaying(false);
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    // Clear canvas when stopped
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onComplete(); // Signal completion
  }, [onComplete]);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLengthRef.current) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLengthRef.current; i++) {
      const barHeight = dataArrayRef.current[i] * 2; // Scale height for effect

      ctx.fillStyle = `hsl(${barHeight + 100}, 100%, 50%)`;
      ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
    animationFrameId.current = requestAnimationFrame(drawVisualizer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.getContext('2d').scale(dpr, dpr);
    }
  }, []);


  return (
    <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center bg-black bg-opacity-90 p-8 text-center crt-glow">
      <h2 className="text-5xl text-purple-400 mb-8 animate-pulse-glow">Music Dance Experience</h2>
      <canvas ref={canvasRef} className="w-full max-w-lg h-48 border-2 border-purple-600 rounded-lg mb-8"></canvas>
      <div className="flex gap-4">
        <button
          onClick={startMusic}
          disabled={playing}
          className="px-8 py-3 rounded-md bg-purple-600 text-white font-bold text-2xl hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
        >
          Start Music
        </button>
        <button
          onClick={stopMusic}
          disabled={!playing}
          className="px-8 py-3 rounded-md bg-gray-600 text-white font-bold text-2xl hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
        >
          End Session
        </button>
      </div>
      <p className="text-xl text-[#e0e8ff] mt-4">Feel the rhythm. Find your harmony. Refine.</p>
    </div>
  );
};

// NEW: Domain Apps Portal Overlay
const domainAppsData = {
  'PRODUCT OWNER': [
    { name: 'Factory', url: 'https://www.factory.ai/', logo: '/Assets/Factory.png', isBackground: true },
    { name: 'PromptBuilder', url: 'https://promptbuilder.pages.dev/', logo: '/Assets/Prompt_Builder.png', isBackground: true },
    { name: 'Travel Disruption User Flow', url: './Product_Owner/travel-disruption-user-flow.html', logo: '/Assets/user_flow.png', isBackground: true },
    { name: 'Travel Disruption Architecture', url: './Product_Owner/travel-disruption-architecture.html', logo: '/Assets/disruption.png', isBackground: true },
  ],
  'DESIGNER': [
  ],
  'ENGINEER': [
  ],
};

const DomainAppsPortal = ({ domain, onClose }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const apps = domainAppsData[domain] || [];

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-gradient-to-br from-black via-gray-900 to-yellow-900 bg-opacity-95">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-yellow-400 shadow-lg shadow-yellow-400/20">
        <h2 className="text-2xl text-yellow-400 drop-shadow-lg glow-text">{domain} Apps</h2>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-md hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/30"
        >
          Close
        </button>
      </div>

      {/* Content */}
      {!selectedApp ? (
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8 overflow-auto max-w-6xl mx-auto">
          {apps.map((app) => (
            <div
              key={app.name}
              onClick={() => window.open(app.url, '_blank', 'noopener,noreferrer')}
              className={`flex flex-col items-center p-4 rounded-lg cursor-pointer border-2 border-transparent hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 relative overflow-hidden max-w-xs ${app.isBackground ? 'min-h-[150px] max-h-[200px] justify-end' : 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg shadow-yellow-900/20'}`}
              style={app.isBackground ? {
                backgroundImage: `url("${app.logo}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {}}
            >
              {app.isBackground && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-yellow-900/20 to-transparent rounded-lg"></div>
              )}
              {!app.isBackground && (
                <img src={app.logo} alt={app.name} className="w-16 h-16 object-contain mb-2 drop-shadow-lg" />
              )}
              <span className={`text-center text-lg ${app.isBackground ? 'relative z-10 text-yellow-100 font-bold drop-shadow-lg text-shadow-glow' : 'text-yellow-100'}`}>
                {app.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Back Bar */}
          <div className="flex items-center p-2 border-b border-yellow-400 shadow-lg shadow-yellow-400/20">
            <button
              onClick={() => setSelectedApp(null)}
              className="mr-4 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/30"
            >Back</button>
            <h3 className="text-xl text-yellow-100">{selectedApp.name}</h3>
            <a
              href={selectedApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-yellow-400 underline hover:text-yellow-300 transition-colors duration-200"
            >Open in new tab</a>
          </div>
          {/* Iframe */}
          <iframe src={selectedApp.url} title={selectedApp.name} className="flex-1 w-full" />
        </div>
      )}
    </div>
  );
};

// ... existing code ...
  const handleAirlineDomainClick = (domain) => {
    setAirlinePortalDomain(domain);
    setCurrentActivity('domain_apps'); // renamed activity
    playSound(700, 'sine', '8n');
  };

  const handleAirlinePortalComplete = () => {
    setCurrentActivity('workflow');
    setAirlinePortalDomain(null);
    addLumonMessage(`Apps for ${airlinePortalDomain} ready for use. Continue your work.`);
  };
// ... existing code ...

// ... existing code ...

// --- Main App Component ---

// Basic Error Boundary to catch React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 text-white text-center p-8 z-[200] crt-glow">
          <h1 className="text-4xl mb-4">SYSTEM ERROR DETECTED</h1>
          <p className="text-xl mb-4">An unexpected error has occurred. Please contact your supervisor.</p>
          <details className="text-left text-sm max-w-lg overflow-auto max-h-60 p-2 border border-red-700 rounded">
            <summary>Error Details</summary>
            <pre className="whitespace-pre-wrap break-words">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}


function App() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [mode, setMode] = useState('innie'); // 'innie' or 'outie'
  const [currentActivity, setCurrentActivity] = useState('workflow'); // 'workflow', 'mdr_game', 'break_room', 'wellness_session', 'mde', 'domain_apps'
  const [workflowStages, setWorkflowStages] = useState([
    { id: 'requirements', name: 'Requirement Gathering', status: 'pending', progress: 0 },
    { id: 'prototyping', name: 'Prototyping & Exp.', status: 'pending', progress: 0 },
    { id: 'design', name: 'Design & Arch.', status: 'pending', progress: 0 },
    { id: 'project_mgmt', name: 'Project Management', status: 'pending', progress: 0 },
    { id: 'code_dev', name: 'Code Dev & VC', status: 'pending', progress: 0 }, // Added name for code_dev
    { id: 'ci_cd', name: 'CI/CD & Deploy', status: 'pending', progress: 0 },
    { id: 'monitoring', name: 'Monitoring & Feedback', status: 'pending', progress: 0 },
  ]);
  const [perks, setPerks] = useState([
    { id: 'waffle_party', name: 'Waffle Party', unlocked: false, threshold: 2 }, // Unlock after 2 successful tasks
    { id: 'finger_trap', name: 'Finger Trap', unlocked: false, threshold: 5 }, // Unlock after 5 successful tasks
    { id: 'mde', name: 'Music Dance Exp.', unlocked: false, threshold: 8 }, // Unlock after 8 successful tasks
  ]);
  const [lumonMessageQueue, setLumonMessageQueue] = useState([]);
  const [displayingLumonMessage, setDisplayingLumonMessage] = useState(null); // Current message being displayed

  // UI state for hideable panels
  const [showEmployeeDirectory, setShowEmployeeDirectory] = useState(false);
  const [showIncentivesProgram, setShowIncentivesProgram] = useState(false);

  // Track successful actions for perks
  const successfulActionsCount = useRef(0);

  // MDR Game specific state
  const [mdrCurrentFile, setMdrCurrentFile] = useState(null); // The specific file for MDR game

  // Airline Portal specific state
  const [airlinePortalDomain, setAirlinePortalDomain] = useState(null);

  // Initial load effect for intro
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem('introPlayed');
    if (hasPlayed) {
      setIsIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIsIntroComplete(true);
    sessionStorage.setItem('introPlayed', 'true');
    addLumonMessage('Welcome, Innie. Your daily assignment awaits. Focus and thrive.');
  }, []);

  // Lumon Message management
  useEffect(() => {
    if (lumonMessageQueue.length > 0 && !displayingLumonMessage) {
      const timer = setTimeout(() => {
        const nextMessage = lumonMessageQueue[0];
        setDisplayingLumonMessage(nextMessage);
        setLumonMessageQueue(prev => prev.slice(1)); // Remove from queue
        playSound(400, 'triangle', '32n'); // Notification sound
      }, 1000); // Small delay before showing message
      return () => clearTimeout(timer);
    }
  }, [lumonMessageQueue, displayingLumonMessage]);

  const addLumonMessage = useCallback((message) => {
    setLumonMessageQueue(prev => [...prev, message]);
  }, []);

  const dismissLumonMessage = useCallback(() => {
    setDisplayingLumonMessage(null);
  }, []);

  // Update workflow stages globally
  const updateOutieWorkflow = useCallback((newStages) => {
    setWorkflowStages(newStages);
  }, []);

  // Perk triggering logic
  const triggerPerk = useCallback(() => {
    successfulActionsCount.current += 1;
    setPerks(prevPerks => prevPerks.map(perk => {
      if (!perk.unlocked && successfulActionsCount.current >= perk.threshold) {
        addLumonMessage(`Congratulations, Lumon employee! You have earned the ${perk.name}.`);
        if (perk.id === 'mde') {
          // Immediately trigger MDE if it's the MDE perk
          setTimeout(() => setCurrentActivity('mde'), 1500);
        } else {
          playSound(Tone.Midi("C6").toFrequency(), 'square', '4n'); // Special perk sound
        }
        return { ...perk, unlocked: true };
      }
      return perk;
    }));
  }, [addLumonMessage]);

  // Break Room trigger
  const triggerBreakRoom = useCallback(() => {
      addLumonMessage('Your compliance is mandatory. Proceed to the Break Room.');
      setCurrentActivity('break_room');
  }, [addLumonMessage]);

  // MDR Game triggers
  const handleMDRGameStart = useCallback(() => {
      setCurrentActivity('mdr_game');
  }, []);

  const handleMDRGameComplete = useCallback((success) => {
      setCurrentActivity('workflow');
      if (success) {
          addLumonMessage('MDR File completed. Your efficiency is noted and appreciated.');
          triggerPerk(); // MDR completion also counts towards perks
          setWorkflowStages(prev => prev.map(stage =>
            stage.id === 'prototyping' ? { ...stage, status: 'completed', progress: 100 } : stage // Assuming MDR is part of prototyping
          ));
      } else {
          addLumonMessage('MDR File incomplete. Further focus is required.');
          // Optionally trigger Break Room or other penalty for MDR failure
      }
  }, [addLumonMessage, triggerPerk]);

  const handleMDRGameFail = useCallback(() => {
      addLumonMessage('A critical error. The Break Room awaits.');
      setCurrentActivity('break_room');
  }, [addLumonMessage]);

  const handleBreakRoomComplete = useCallback(() => {
      addLumonMessage('Your session is complete. Return to your station.');
      setCurrentActivity('workflow');
  }, [addLumonMessage]);

  const handleMDEComplete = useCallback(() => {
    addLumonMessage('The Music Dance Experience concludes. Return to duty with invigorated spirit.');
    setCurrentActivity('workflow');
  }, [addLumonMessage]);

  // Airline Portal trigger
  const handleAirlineDomainClick = (domain) => {
    setAirlinePortalDomain(domain);
    setCurrentActivity('domain_apps'); // renamed activity
    playSound(700, 'sine', '8n');
  };

  const handleAirlinePortalComplete = () => {
    setCurrentActivity('workflow');
    setAirlinePortalDomain(null);
    addLumonMessage(`Apps for ${airlinePortalDomain} ready for use. Continue your work.`);
  };

  // Wellness Session (periodic message) - disabled for now
  // useEffect(() => {
  //   const wellnessInterval = setInterval(() => {
  //     if (currentActivity === 'workflow') { // Only trigger if in main workflow
  //       addLumonMessage('Attention: It is time for your scheduled Wellness session. Take a moment for self-care.');
  //     }
  //   }, 1800 * 1000); // Every 30 minutes
  //   return () => clearInterval(wellnessInterval);
  // }, [addLumonMessage, currentActivity]);


  return (
    <div className="relative h-screen w-screen bg-[#1a234a] flex items-center justify-center">
      <CRTWrapper>
        <ErrorBoundary> {/* Wrap the main content with ErrorBoundary */}
          {!isIntroComplete ? (
            <IntroAnimation onAnimationComplete={handleIntroComplete} />
          ) : (
            <div className="flex flex-col h-full w-full">
              {/* Mode Switcher */}
              <div className="w-full flex justify-center p-4 z-20 flex-shrink-0">
                <button
                  onClick={() => setMode('innie')}
                  className={`px-6 py-2 rounded-l-md border-2 border-r-0 border-yellow-400 text-xl font-bold
                             ${mode === 'innie' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30' : 'bg-[#1a234a] text-yellow-100'}
                             hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 hover:text-black transition-all duration-200 glow-text`}
                >
                  Innie Mode
                </button>
                <button
                  onClick={() => setMode('outie')}
                  className={`px-6 py-2 rounded-r-md border-2 border-yellow-400 text-xl font-bold
                             ${mode === 'outie' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/30' : 'bg-[#1a234a] text-yellow-100'}
                             hover:bg-gradient-to-r hover:from-yellow-300 hover:to-yellow-400 hover:text-black transition-all duration-200 glow-text`}
                >
                  Outie Mode
                </button>
              </div>

              {/* Software Factory Description - Only show in Innie Mode */}
              {mode === 'innie' && (
                <div className="w-full px-8 pb-4 z-20 flex-shrink-0">
                  <div className="max-w-4xl mx-auto text-center">
                    <p className="text-lg text-black leading-relaxed bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-lg shadow-lg shadow-yellow-400/30 glow-text">
                      Software Factory allows teams from solo PM-Developers up to large groups to organize themselves, write quality requirements, build thorough Engineering plans, extract detailed tickets, write quality code, QA thoroughly and repeat this process in an increasingly automated way until the project works. It is tuned for complex environments, making it also work very elegantly for de novo projects.
                    </p>
                  </div>
                </div>
              )}

              {/* Render current mode and activity */}
              <div className="flex-1 overflow-hidden">
                {mode === 'innie' ? (
                  <>
                    {currentActivity === 'workflow' && (
                      <InnieWorkspace
                        setOutieWorkflow={updateOutieWorkflow}
                        setMode={setMode}
                        addLumonMessage={addLumonMessage}
                        triggerPerk={triggerPerk}
                        triggerBreakRoom={triggerBreakRoom}
                        triggerMDRGame={handleMDRGameStart}
                        onDomainClick={handleAirlineDomainClick}
                        showEmployeeDirectory={showEmployeeDirectory}
                        setShowEmployeeDirectory={setShowEmployeeDirectory}
                        showIncentivesProgram={showIncentivesProgram}
                        setShowIncentivesProgram={setShowIncentivesProgram}
                      />
                    )}
                    {currentActivity === 'mdr_game' && (
                      <MDRGame
                        onGameComplete={handleMDRGameComplete}
                        onGameFail={handleMDRGameFail}
                        currentFile={mdrCurrentFile}
                        setCurrentFile={setMdrCurrentFile}
                      />
                    )}
                    {currentActivity === 'break_room' && (
                      <BreakRoom onAcknowledge={handleBreakRoomComplete} />
                    )}
                    {currentActivity === 'mde' && (
                        <MusicDanceExperience onComplete={handleMDEComplete} />
                    )}
                    {currentActivity === 'domain_apps' && airlinePortalDomain && (
                      <DomainAppsPortal domain={airlinePortalDomain} onClose={handleAirlinePortalComplete} />
                    )}
                    {displayingLumonMessage && (
                      <LumonMessage message={displayingLumonMessage} onDismiss={dismissLumonMessage} />
                    )}
                  </>
                ) : (
                  <OutieOverview workflowStages={workflowStages} perks={perks} />
                )}
              </div>


            </div>
          )}
        </ErrorBoundary>
      </CRTWrapper>
    </div>
  );
}

export default App;

// ------------------- NEW WORKSPACE COMPONENTS -------------------

const InnieWorkspace = ({ setOutieWorkflow, addLumonMessage, triggerPerk, triggerBreakRoom, triggerMDRGame, onDomainClick, showEmployeeDirectory, setShowEmployeeDirectory, showIncentivesProgram, setShowIncentivesProgram }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [draggedTool, setDraggedTool] = useState(null);

  const aiTools = [
    { id: 'vibe_coding', name: 'Vibe-coding', icon: <DataToolIcon />, goodDrop: 'PRODUCT OWNER', badDrop: 'ENGINEER' },
    { id: 'designing', name: 'Designing', icon: <ModelToolIcon />, goodDrop: 'DESIGNER', badDrop: 'PRODUCT OWNER' },
    { id: 'security', name: 'Security', icon: <CodeToolIcon />, goodDrop: 'ENGINEER', badDrop: 'DESIGNER' },
    { id: 'database', name: 'Database', icon: <CiCdToolIcon />, goodDrop: 'ENGINEER', badDrop: 'PRODUCT OWNER' },
    { id: 'ai_system', name: 'AI-System', icon: <BugToolIcon />, goodDrop: 'ENGINEER', badDrop: 'DESIGNER' },
  ];

  const handleToolDrop = useCallback((domainType) => {
    if (!draggedTool) {
      setMessage('No tool selected for action.');
      setMessageType('error');
      playSound(100, 'sawtooth', '16n', -5);
      return;
    }

    let feedback = '';
    if (draggedTool.goodDrop === domainType) {
      feedback = `Aligned: ${draggedTool.name} -> ${domainType}.`;
      setMessageType('info');
      triggerPerk();
    } else {
      feedback = `Misplaced: ${draggedTool.name} not suitable for ${domainType}.`;
      setMessageType('error');
      triggerBreakRoom();
    }
    setMessage(feedback);
    setDraggedTool(null);
  }, [draggedTool, triggerPerk, triggerBreakRoom]);

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
      <div className="flex justify-between items-center w-full pb-2 mb-4 border-b-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
        <span className="text-xl md:text-2xl text-yellow-400 glow-text">Frameworks</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowEmployeeDirectory(true)}
            className="px-3 py-1 text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border border-yellow-400 rounded hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/30"
          >
            Directory
          </button>
          <button
            onClick={() => setShowIncentivesProgram(true)}
            className="px-3 py-1 text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border border-yellow-400 rounded hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/30"
          >
            Incentives
          </button>
          <LumonLogo />
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row w-full gap-4 overflow-hidden">
        {/* Tool Palette */}
        <div className="w-full md:w-48 flex flex-row md:flex-col items-center gap-4 p-4 rounded-lg border-2 border-yellow-400 shadow-lg shadow-yellow-400/20 overflow-auto">
          {aiTools.map(t => (
            <div key={t.id} draggable onDragStart={e => { e.dataTransfer.setData('toolId', t.id); setDraggedTool(t); }}
              className="flex flex-col items-center p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-yellow-400 cursor-grab hover:border-yellow-300 hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300 w-28 md:w-auto flex-shrink-0 shadow-lg shadow-yellow-900/20">
              {t.icon}
              <span className="text-center text-sm mt-1 text-yellow-100">{t.name}</span>
            </div>
          ))}
          <button onClick={triggerMDRGame} className="mt-4 px-4 py-2 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/30">Start MDR</button>
        </div>

        {/* Domains */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-auto">
          {[
            { id: 'PRODUCT OWNER', Icon: OperationsIcon, desc: 'Product Owner', hasBackground: true, backgroundImage: 'PO.png' },
            { id: 'DESIGNER', Icon: CrewIcon, desc: 'Designer', hasBackground: true, backgroundImage: 'Designer.png' },
            { id: 'ENGINEER', Icon: FlightIcon, desc: 'Engineer', hasBackground: true, backgroundImage: 'developer.png' },
          ].map(c => (
            <div key={c.id} onClick={() => onDomainClick(c.id)} onDrop={e => { e.preventDefault(); handleToolDrop(c.id); }} onDragOver={e => e.preventDefault()}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-[#e0e8ff] crt-glow hover:bg-[#0a0f2b] transition-colors duration-200 min-h-[120px] cursor-pointer relative overflow-hidden ${c.hasBackground ? '' : ''}`}
              style={c.hasBackground ? { 
                backgroundImage: `url("/Assets/${c.backgroundImage}")`,
                backgroundSize: '80%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {}}>
              {c.hasBackground && (
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
              )}
              <span className={`text-2xl ${c.hasBackground ? 'relative z-10 text-white font-bold drop-shadow-lg' : ''}`}>{c.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Directory Overlay */}
      {showEmployeeDirectory && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#0a0f2b] border-2 border-[#e0e8ff] rounded-lg crt-glow p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-yellow-400 glow-text">Employee Directory</h3>
              <button
                onClick={() => setShowEmployeeDirectory(false)}
                className="text-[#e0e8ff] hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-auto max-h-60">
              <ul className="text-sm">
                {[
                  { id: 'mark', name: 'Mark S.', status: 'Active', role: 'Macrodata Refinement' },
                  { id: 'helen', name: 'Helena E.', status: 'Active', role: 'Macrodata Refinement' },
                  { id: 'dylan', name: 'Dylan G.', status: 'Active', role: 'Macrodata Refinement' },
                  { id: 'irving', name: 'Irving B.', status: 'Active', role: 'Macrodata Refinement' },
                  { id: 'oandd', name: 'Burt G.', status: 'Active', role: 'Optics & Design' },
                  { id: 'oandd2', name: 'Felicia G.', status: 'Active', role: 'Optics & Design' },
                  { id: 'mgr', name: 'Patricia C.', status: 'Active', role: 'Department Chief' },
                ].map(emp => (
                  <li key={emp.id} className="flex items-center gap-2 py-1 border-b border-[#1f2d5a] last:border-b-0">
                    <LumonHeadIcon className="w-6 h-6" />
                    <span>{emp.name} ({emp.role})</span>
                    <span className={`ml-auto text-xs ${emp.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                      {emp.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Incentives Program Overlay */}
      {showIncentivesProgram && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#0a0f2b] border-2 border-[#e0e8ff] rounded-lg crt-glow p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-yellow-400 glow-text">Incentives Program</h3>
              <button
                onClick={() => setShowIncentivesProgram(false)}
                className="text-[#e0e8ff] hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {[
                { id: 'waffle_party', name: 'Waffle Party', unlocked: false },
                { id: 'finger_trap', name: 'Finger Trap', unlocked: false },
                { id: 'mde', name: 'Music Dance Exp.', unlocked: false },
              ].map(perk => (
                <div key={perk.id} className="flex items-center gap-2">
                  {perk.id === 'waffle_party' && <WafflePartyIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
                  {perk.id === 'finger_trap' && <FingerTrapIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
                  {perk.id === 'mde' && <MdeIcon className={`w-6 h-6 ${perk.unlocked ? 'text-green-400' : 'text-gray-600'}`} />}
                  <span className={perk.unlocked ? 'text-white' : 'text-gray-600 line-through'}>{perk.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OutieOverview = ({ workflowStages, perks }) => (
  <div className="flex flex-col h-full w-full p-4">
    <div className="flex justify-between items-center w-full pb-2 mb-4 border-b-2 border-yellow-400 shadow-lg shadow-yellow-400/20">
      <span className="text-xl md:text-2xl text-yellow-400 glow-text">Final Output</span>
      <LumonLogo />
    </div>
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        <div 
          className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-[#e0e8ff] crt-glow hover:bg-gradient-to-br hover:from-yellow-400/30 hover:to-yellow-500/30 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/40 transition-all duration-300 min-h-[350px] cursor-pointer relative overflow-hidden"
          style={{
            backgroundImage: 'url("/Assets/outie.png")',
            backgroundSize: '80%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-300"></div>
          <span className="relative z-10 text-white font-bold drop-shadow-lg text-3xl">
            OUTIE RESULT
          </span>
        </div>
        
        <div 
          className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-[#e0e8ff] crt-glow hover:bg-gradient-to-br hover:from-yellow-400/30 hover:to-yellow-500/30 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/40 transition-all duration-300 min-h-[350px] cursor-pointer relative overflow-hidden"
          style={{
            backgroundImage: 'url("/Assets/framework.png")',
            backgroundSize: '80%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg hover:bg-opacity-20 transition-all duration-300"></div>
          <span className="relative z-10 text-white font-bold drop-shadow-lg text-3xl">
            FRAMEWORK
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------
