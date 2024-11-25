import { makeMutable } from 'react-native-reanimated';

import { Mutable, Position } from '@types';
import {
  ALIGNMENT_WEIGHT,
  ANGLE_CHANGE,
  AVOID_FORCE,
  AVOID_MARGIN,
  AVOID_MARGIN_VERTICAL,
  COHESION_WEIGHT,
  MAX_FORCE,
  MAX_SPEED,
  PERCEPTION_RADIUS,
  SEPARATION_RADIUS,
  SEPARATION_WEIGHT,
  WANDER_OFFSET,
  WANDER_RADIUS,
  WANDER_WEIGHT
} from './constants';

export type Boid = {
  position: Mutable<Position>;
  velocity: Mutable<Position>;
  wanderAngle: Mutable<number>;
};

export const createBoid = (x: number, y: number): Boid => {
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
  const steering = [0, 0];

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
  if (boid.position.value[1] < AVOID_MARGIN_VERTICAL) {
    steering[1] +=
      (AVOID_MARGIN_VERTICAL - boid.position.value[1]) * AVOID_FORCE;
  }
  // Bottom boundary
  else if (boid.position.value[1] > height - AVOID_MARGIN_VERTICAL) {
    steering[1] -=
      (boid.position.value[1] - (height - AVOID_MARGIN_VERTICAL)) * AVOID_FORCE;
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
  const heading = Math.atan2(boid.velocity.value[1], boid.velocity.value[0]);
  const circleCenter = [
    boid.position.value[0] + Math.cos(heading) * WANDER_OFFSET,
    boid.position.value[1] + Math.sin(heading) * WANDER_OFFSET
  ];

  // Calculate displacement force
  const displacement = [
    Math.cos(boid.wanderAngle.value) * WANDER_RADIUS,
    Math.sin(boid.wanderAngle.value) * WANDER_RADIUS
  ];

  // Calculate wander force
  const wanderForce = [
    (circleCenter[0] + displacement[0] - boid.position.value[0]) *
      WANDER_WEIGHT,
    (circleCenter[1] + displacement[1] - boid.position.value[1]) * WANDER_WEIGHT
  ];

  return wanderForce;
};

const limitSteering = (steering: Position, boid: Boid, maxSpeed: number) => {
  'worklet';

  steering[0] -= boid.position.value[0];
  steering[1] -= boid.position.value[1];

  const mag = magnitude(steering[0], steering[1]);

  if (mag > 0) {
    steering[0] = (steering[0] / mag) * maxSpeed;
    steering[1] = (steering[1] / mag) * maxSpeed;

    steering[0] -= boid.velocity.value[0];
    steering[1] -= boid.velocity.value[1];

    const steerMag = magnitude(steering[0], steering[1]);
    if (steerMag > MAX_FORCE) {
      steering[0] = (steering[0] / steerMag) * MAX_FORCE;
      steering[1] = (steering[1] / steerMag) * MAX_FORCE;
    }
  }

  return steering;
};

const align = (boid: Boid, boids: Boid[], maxSpeed: number) => {
  'worklet';

  const steering = [0, 0];
  let total = 0;

  for (const other of boids) {
    const d = distance(
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

    return limitSteering(steering, boid, maxSpeed);
  }
  return steering;
};

const cohesion = (boid: Boid, boids: Boid[], maxSpeed: number) => {
  'worklet';

  const steering = [0, 0];
  let total = 0;

  for (const other of boids) {
    const d = distance(
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

    return limitSteering(steering, boid, maxSpeed);
  }
  return steering;
};

const separation = (boid: Boid, boids: Boid[], maxSpeed: number) => {
  'worklet';

  let steering = [0, 0];
  let total = 0;

  for (const other of boids) {
    const d = distance(
      boid.position.value[0],
      boid.position.value[1],
      other.position.value[0],
      other.position.value[1]
    );

    if (other !== boid && d < SEPARATION_RADIUS) {
      const diff = [
        boid.position.value[0] - other.position.value[0],
        boid.position.value[1] - other.position.value[1]
      ];

      // Square the denominator to make separation force increase more rapidly as distance decreases
      const factor = 1 / (d * d);
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

    steering = limitSteering(steering, boid, maxSpeed);

    // const mag = magnitude(steering[0], steering[1]);
    // if (mag > 0) {
    //   steering[0] = (steering[0] / mag) * MAX_SPEED;
    //   steering[1] = (steering[1] / mag) * MAX_SPEED;

    //   steering[0] -= boid.velocity.value[0];
    //   steering[1] -= boid.velocity.value[1];

    //   const steerMag = magnitude(steering[0], steering[1]);
    //   if (steerMag > MAX_FORCE) {
    //     steering[0] = (steering[0] / steerMag) * MAX_FORCE;
    //     steering[1] = (steering[1] / steerMag) * MAX_FORCE;
    //   }
    // }
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

export const update = (
  boids: Boid[],
  delta: number,
  maxSpeed: number,
  width: number,
  height: number
) => {
  'worklet';

  boids.forEach((boid) => {
    const otherBoids = boids.filter((b) => b !== boid);
    const alignmentValue = align(boid, otherBoids, maxSpeed);
    const cohesionValue = cohesion(boid, otherBoids, maxSpeed);
    const separationValue = separation(boid, otherBoids, maxSpeed);
    const avoidBoundsValue = avoidBounds(boid, width, height);
    const wanderValue = wander(boid);

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
    const speed = magnitude(boid.velocity.value[0], boid.velocity.value[1]);
    if (speed > maxSpeed) {
      boid.velocity.modify((v) => {
        v[0] = (v[0] / speed) * maxSpeed;
        v[1] = (v[1] / speed) * maxSpeed;
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
