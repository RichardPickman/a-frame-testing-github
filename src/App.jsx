import { PerspectiveCamera } from '@react-three/drei';
import 'aframe';
import 'aframe-particle-system-component';
import 'aframe-state-component';
import 'locar';
import { LocationBased, WebcamRenderer } from 'locar';
import { useEffect, useRef, useState } from 'react';
import { BoxGeometry, MeshBasicMaterial, Scene, WebGLRenderer } from 'three';
import './App.css';
import './scene';

const BoxAFrame = () => {
    const box = useRef(null);
    const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
    const [material, setMaterial] = useState({ color: 'red' });
    const [coordinates, setCoordinates] = useState({
        longitude: 0,
        latitude: 0,
    });

    useEffect(() => {
        const updateCoordinates = (event) => {
            console.log('event', event);

            setCoordinates({ longitude, latitude });
        };

        box.current.addEventListener(
            'gps-camera-update-position',
            updateCoordinates,
        );

        return () => {
            box.current.removeEventListener(
                'gps-camera-update-position',
                updateCoordinates,
            );
        };
    }, []);

    useEffect(() => {
        console.log('scale', scale);
        console.log('material', material);
        console.log('coordinates', coordinates);

        console.log('box', box.current);
    }, [box]);

    return (
        <a-box
            ref={box}
            scale={scale}
            material={material}
            gps-new-entity-place={`latitude: ${coordinates.latitude}; longitude: ${coordinates.longitude}`}
        ></a-box>
    );
};

const AFrameScene = () => {
    const camera = useRef(null);

    return (
        <a-scene
            vr-mode-ui="enabled: false"
            arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false"
            renderer="antialias: true; alpha: true"
        >
            <a-camera
                ref={camera}
                gps-new-camera="gpsMinDistance: 5"
            ></a-camera>

            <a-entity
                material="color: red"
                geometry="primitive: box"
                gps-new-entity-place="latitude: 50.065251; longitude: 19.951186"
                scale="10 10 10"
            ></a-entity>

            <BoxAFrame />
        </a-scene>
    );
};

function App() {
    const scene = useRef(new Scene());
    const camera = useRef(
        new PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.001,
            100,
        ),
    );
    const renderer = useRef(new WebGLRenderer());
    const box = useRef(new BoxGeometry(2, 2, 2));
    const cube = useRef(
        new THREE.Mesh(box, new MeshBasicMaterial({ color: 'hotpink' })),
    );

    const locar = useRef(new LocationBased(scene.current, camera.current));
    const cam = useRef(new WebcamRenderer(renderer.current));

    const animate = () => {
        cam.current.update();
        renderer.current.render(scene.current, camera.current);
    };

    useEffect(() => {
        renderer.current.setSize(window.innerWidth, window.innerHeight);
        renderer.current.setAnimationLoop(animate);
    }, []);

    useEffect(() => {
        locar.current.fakeGps(-0.72, 51.05);
        locar.current.add(cube.current, -0.72, 51.0501);
    }, []);

    useEffect(() => {
        const resizeEvent = () => {
            renderer.current.setSize(window.innerWidth, window.innerHeight);
            camera.current.aspect = window.innerWidth / window.innerHeight;
            camera.current.updateProjectionMatrix();
        };

        window.addEventListener('resize', resizeEvent);

        return () => {
            window.removeEventListener('resize', resizeEvent);
        };
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div id="app">
            <AFrameScene></AFrameScene>
        </div>
    );
}

export default App;
