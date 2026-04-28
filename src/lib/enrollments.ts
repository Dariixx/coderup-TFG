import { loadFromStorage, saveToStorage } from "./storage";
import type { Course, Enrollment } from "./types";

const ENROLLMENTS_KEY = "coderup-enrollments";

type EnrollmentListener = () => void;

let enrollments: Enrollment[] = [];
let listeners: EnrollmentListener[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

function persist() {
  saveToStorage(ENROLLMENTS_KEY, enrollments);
}

export function initEnrollments() {
  enrollments = loadFromStorage<Enrollment[]>(ENROLLMENTS_KEY, []);
}

export function subscribeEnrollments(listener: EnrollmentListener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

export function getEnrollments() {
  return enrollments;
}

export function getUserEnrollments(userId: string) {
  return enrollments.filter((enrollment) => enrollment.userId === userId);
}

export function hasEnrollment(userId: string, courseSlug: string) {
  return enrollments.some((enrollment) => enrollment.userId === userId && enrollment.courseSlug === courseSlug);
}

export function createEnrollment(userId: string, course: Course) {
  if (hasEnrollment(userId, course.slug)) {
    return null;
  }

  const enrollment: Enrollment = {
    id: crypto.randomUUID(),
    userId,
    courseId: String(course.id),
    courseTitle: course.title,
    courseSlug: course.slug,
    progress: 0,
    status: "active",
    enrolledAt: new Date().toISOString(),
    lastLesson: "Bienvenida al curso",
  };

  enrollments = [...enrollments, enrollment];
  persist();
  notify();
  return enrollment;
}

export function seedEnrollments(userId: string, courses: Course[]) {
  courses.forEach((course) => {
    createEnrollment(userId, course);
  });
}

export function updateEnrollmentProgress(enrollmentId: string, patch: Partial<Enrollment>) {
  enrollments = enrollments.map((enrollment) =>
    enrollment.id === enrollmentId ? { ...enrollment, ...patch } : enrollment,
  );
  persist();
  notify();
}
