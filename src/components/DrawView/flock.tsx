import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Canvas, Circle, Group, Skia } from '@shopify/react-native-skia';
import {
  FrameInfo,
  makeMutable,
  useDerivedValue,
  useFrameCallback,
  useSharedValue
} from 'react-native-reanimated';

import { Mutable, Position } from '@types';
import { debugMsg } from '../../helpers/global';

type Boid = {
  position: Mutable<Position>;
  velocity: Mutable<Position>;
  wanderAngle: Mutable<number>;
};

const NUM_BOIDS = 5;
const MAX_SPEED = 3;
const MAX_FORCE = 0.05;

const PERCEPTION_RADIUS = 50;
const SEPARATION_RADIUS = 50;

const AVOID_MARGIN = 100;
const AVOID_FORCE = 0.15;

const ANGLE_CHANGE = 0.3;
const WANDER_OFFSET = 20;
const WANDER_RADIUS = 1;

const WANDER_WEIGHT = 0.1;
const ALIGNMENT_WEIGHT = 1.5;
const COHESION_WEIGHT = 0.1;
const SEPARATION_WEIGHT = 1.0;

const createBoid = (x: number, y: number): Boid => {
  return {
    position: makeMutable([x, y]),
    velocity: makeMutable([Math.random() * 2 - 1, Math.random() * 2 - 1]),
    wanderAngle: makeMutable(Math.random() * Math.PI * 2)
  };
};

// Helper function to calculate distance
const distance = (x1: number, y1: number, x2: number, y2: number) => {
  'worklet';
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
};

// Helper function to calculate magnitude of a vector
const magnitude = (x: number, y: number) => {
  'worklet';
  return Math.sqrt(x * x + y * y);
};

const avoidBounds = (boid: Boid, width: number, height: number) => {
  'worklet';
  let steering = [0, 0];

  // Left boundary
  if (boid.position.value[0] < AVOID_MARGIN) {
    steering[0] += (AVOID_MARGIN - boid.position.value[0]) * AVOID_FORCE;
  }
  // Right boundary
  else if (boid.position.value[0] > width - AVOID_MARGIN) {
    steering[0] -=
      (boid.position.value[0] - (width - AVOID_MARGIN)) * AVOID_FORCE;
  }

  // Top boundary
  if (boid.position.value[1] < AVOID_MARGIN) {
    steering[1] += (AVOID_MARGIN - boid.position.value[1]) * AVOID_FORCE;
  }
  // Bottom boundary
  else if (boid.position.value[1] > height - AVOID_MARGIN) {
    steering[1] -=
      (boid.position.value[1] - (height - AVOID_MARGIN)) * AVOID_FORCE;
  }

  // Ensure boids don't get stuck exactly on the boundary
  if (boid.position.value[0] <= 0) boid.position.value[0] = 1;
  if (boid.position.value[0] >= width) boid.position.value[0] = width - 1;
  if (boid.position.value[1] <= 0) boid.position.value[1] = 1;
  if (boid.position.value[1] >= height) boid.position.value[1] = height - 1;

  return steering;
};

const wander = (boid: Boid) => {
  'worklet';

  // Randomly adjust wander angle
  boid.wanderAngle.value += (Math.random() * 2 - 1) * ANGLE_CHANGE;

  // Calculate center of wander circle (ahead of boid)
  let heading = Math.atan2(boid.velocity.value[1], boid.velocity.value[0]);
  let circleCenter = [
    boid.position.value[0] + Math.cos(heading) * WANDER_OFFSET,
    boid.position.value[1] + Math.sin(heading) * WANDER_OFFSET
  ];

  // Calculate displacement force
  let displacement = [
    Math.cos(boid.wanderAngle.value) * WANDER_RADIUS,
    Math.sin(boid.wanderAngle.value) * WANDER_RADIUS
  ];

  // Calculate wander force
  let wanderForce = [
    (circleCenter[0] + displacement[0] - boid.position.value[0]) *
      WANDER_WEIGHT,
    (circleCenter[1] + displacement[1] - boid.position.value[1]) * WANDER_WEIGHT
  ];

  return wanderForce;
};

const align = (boid: Boid, boids: Boid[]) => {
  'worklet';

  let steering = [0, 0];
  let total = 0;

  for (let other of boids) {
    let d = distance(
      boid.position.value[0],
      boid.position.value[1],
      other.position.value[0],
      other.position.value[1]
    );
    if (other !== boid && d < PERCEPTION_RADIUS) {
      steering[0] += other.velocity.value[0];
      steering[1] += other.velocity.value[1];
      total++;
    }
  }

  if (total > 0) {
    steering[0] /= total;
    steering[1] /= total;

    let mag = magnitude(steering[0], steering[1]);
    if (mag > 0) {
      steering[0] = (steering[0] / mag) * MAX_SPEED;
      steering[1] = (steering[1] / mag) * MAX_SPEED;

      steering[0] -= boid.velocity.value[0];
      steering[1] -= boid.velocity.value[1];

      let steerMag = magnitude(steering[0], steering[1]);
      if (steerMag > MAX_FORCE) {
        steering[0] = (steering[0] / steerMag) * MAX_FORCE;
        steering[1] = (steering[1] / steerMag) * MAX_FORCE;
      }
    }
  }
  return steering;
};

const cohesion = (boid: Boid, boids: Boid[]) => {
  'worklet';

  let steering = [0, 0];
  let total = 0;

  for (let other of boids) {
    let d = distance(
      boid.position.value[0],
      boid.position.value[1],
      other.position.value[0],
      other.position.value[1]
    );
    if (other !== boid && d < PERCEPTION_RADIUS) {
      steering[0] += other.position.value[0];
      steering[1] += other.position.value[1];
      total++;
    }
  }

  if (total > 0) {
    steering[0] /= total;
    steering[1] /= total;

    steering[0] -= boid.position.value[0];
    steering[1] -= boid.position.value[1];

    let mag = magnitude(steering[0], steering[1]);
    if (mag > 0) {
      steering[0] = (steering[0] / mag) * MAX_SPEED;
      steering[1] = (steering[1] / mag) * MAX_SPEED;

      steering[0] -= boid.velocity.value[0];
      steering[1] -= boid.velocity.value[1];

      let steerMag = magnitude(steering[0], steering[1]);
      if (steerMag > MAX_FORCE) {
        steering[0] = (steering[0] / steerMag) * MAX_FORCE;
        steering[1] = (steering[1] / steerMag) * MAX_FORCE;
      }
    }
  }
  return steering;
};

const separation = (boid: Boid, boids: Boid[]) => {
  'worklet';

  let steering = [0, 0];
  let total = 0;

  for (let other of boids) {
    let d = distance(
      boid.position.value[0],
      boid.position.value[1],
      other.position.value[0],
      other.position.value[1]
    );
    if (other !== boid && d < PERCEPTION_RADIUS) {
      let diff = [
        boid.position.value[0] - other.position.value[0],
        boid.position.value[1] - other.position.value[1]
      ];
      diff[0] /= d;
      diff[1] /= d;
      steering[0] += diff[0];
      steering[1] += diff[1];
      total++;
    }
  }

  if (total > 0) {
    steering[0] /= total;
    steering[1] /= total;

    let mag = magnitude(steering[0], steering[1]);
    if (mag > 0) {
      steering[0] = (steering[0] / mag) * MAX_SPEED;
      steering[1] = (steering[1] / mag) * MAX_SPEED;

      steering[0] -= boid.velocity.value[0];
      steering[1] -= boid.velocity.value[1];

      let steerMag = magnitude(steering[0], steering[1]);
      if (steerMag > MAX_FORCE) {
        steering[0] = (steering[0] / steerMag) * MAX_FORCE;
        steering[1] = (steering[1] / steerMag) * MAX_FORCE;
      }
    }
  }
  return steering;
};

const separation2 = (boid: Boid, boids: Boid[]) => {
  'worklet';

  let steering = [0, 0];
  let total = 0;

  for (let other of boids) {
    let d = distance(
      boid.position.value[0],
      boid.position.value[1],
      other.position.value[0],
      other.position.value[1]
    );

    if (other !== boid && d < SEPARATION_RADIUS) {
      let diff = [
        boid.position.value[0] - other.position.value[0],
        boid.position.value[1] - other.position.value[1]
      ];

      // Square the denominator to make separation force increase more rapidly as distance decreases
      let factor = 1 / (d * d);
      diff[0] *= factor;
      diff[1] *= factor;

      steering[0] += diff[0];
      steering[1] += diff[1];
      total++;
    }
  }

  if (total > 0) {
    steering[0] /= total;
    steering[1] /= total;

    let mag = magnitude(steering[0], steering[1]);
    if (mag > 0) {
      steering[0] = (steering[0] / mag) * MAX_SPEED;
      steering[1] = (steering[1] / mag) * MAX_SPEED;

      steering[0] -= boid.velocity.value[0];
      steering[1] -= boid.velocity.value[1];

      let steerMag = magnitude(steering[0], steering[1]);
      if (steerMag > MAX_FORCE) {
        steering[0] = (steering[0] / steerMag) * MAX_FORCE;
        steering[1] = (steering[1] / steerMag) * MAX_FORCE;
      }
    }
  }

  // Apply separation weight
  steering[0] *= SEPARATION_WEIGHT;
  steering[1] *= SEPARATION_WEIGHT;

  return steering;
};

const edges = (boid: Boid, width: number, height: number) => {
  'worklet';
  if (boid.position.value[0] > width) boid.position.value[0] = 0;
  else if (boid.position.value[0] < 0) boid.position.value[0] = width;
  if (boid.position.value[1] > height) boid.position.value[1] = 0;
  else if (boid.position.value[1] < 0) boid.position.value[1] = height;
};

const update = (
  boids: Boid[],
  delta: number,
  width: number,
  height: number
) => {
  'worklet';

  boids.forEach((boid) => {
    const otherBoids = boids.filter((b) => b !== boid);
    let alignmentValue = align(boid, otherBoids);
    let cohesionValue = cohesion(boid, otherBoids);
    // let separationValue = separation(boid, otherBoids);
    let separationValue = separation2(boid, otherBoids);
    let avoidBoundsValue = avoidBounds(boid, width, height);
    let wanderValue = wander(boid);

    // Add forces
    boid.velocity.modify((v) => {
      // Apply weights to each force
      const vx =
        alignmentValue[0] * ALIGNMENT_WEIGHT +
        cohesionValue[0] * COHESION_WEIGHT +
        separationValue[0] +
        avoidBoundsValue[0] +
        wanderValue[0];
      const vy =
        alignmentValue[1] * ALIGNMENT_WEIGHT +
        cohesionValue[1] * COHESION_WEIGHT +
        separationValue[1] +
        avoidBoundsValue[1] +
        wanderValue[1];

      v[0] += vx;
      v[1] += vy;
      return v;
    });

    // Limit speed
    let speed = magnitude(boid.velocity.value[0], boid.velocity.value[1]);
    if (speed > MAX_SPEED) {
      boid.velocity.modify((v) => {
        v[0] = (v[0] / speed) * MAX_SPEED;
        v[1] = (v[1] / speed) * MAX_SPEED;
        return v;
      });
    }

    boid.position.modify((p) => {
      p[0] += boid.velocity.value[0];
      p[1] += boid.velocity.value[1];
      return p;
    });

    edges(boid, width, height);
  });
};

export const useBoids = (numBoids: number, width: number, height: number) => {
  const [boids, setBoids] = useState<Boid[]>([]);

  useEffect(() => {
    const boids = Array.from({ length: numBoids }, (_, idx) =>
      createBoid(Math.random() * width, Math.random() * height)
    );
    setBoids(boids);
  }, [numBoids, width, height]);

  return boids;
};

export const BoidSimulation = () => {
  // const width = 400;
  // const height = 600;
  const [viewDims, setViewDims] = useState<Position | null>(null);

  const [boids, setBoids] = useState<Boid[]>([]);

  useEffect(() => {
    if (!viewDims) return;
    const boids = Array.from({ length: NUM_BOIDS }, (_, idx) =>
      createBoid(Math.random() * viewDims[0], Math.random() * viewDims[1])
    );
    setBoids(boids);
  }, [viewDims]);

  useFrameCallback((frameInfo: FrameInfo) => {
    if (!viewDims) return;
    const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
    update(boids, delta, viewDims[0], viewDims[1]);
  });

  return (
    <Canvas
      style={styles.canvas}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setViewDims([width, height]);
      }}
    >
      {viewDims && (
        <Group>
          {boids.map((boid, index) => (
            <BoidSprite key={index} boid={boid} />
          ))}
        </Group>
      )}
    </Canvas>
  );
};

const BoidSprite = ({ boid }: { boid: Boid }) => {
  const cx = useDerivedValue(() => boid.position.value[0]);
  const cy = useDerivedValue(() => boid.position.value[1]);

  return <Circle cx={cx} cy={cy} r={4} color='white' />;
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
