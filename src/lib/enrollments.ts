import {
  createEnrollment as createEnrollmentApi,
  getEnrollments as getEnrollmentsApi,
  updateEnrollment as updateEnrollmentApi,
} from "./api";
import type { Course, Enrollment } from "./types";

type EnrollmentListener = () => void;

let enrollments: Enrollment[] = [];
let listeners: EnrollmentListener[] = [];
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function mapEnrollment(record: any): Enrollment {
  return {
    id: String(record.id),
    userId: String(record.user_id),
    courseId: String(record.course_id),
    courseTitle: record.course_title,
    courseSlug: record.course_slug,
    progress: Number(record.progress) || 0,
    status: record.status === "completed" ? "completed" : "active",
    enrolledAt: record.enrolled_at ?? new Date().toISOString(),
    lastLesson: record.last_lesson ?? "Bienvenida al curso",
  };
}

export async function initEnrollments() {
  const response = await getEnrollmentsApi();
  if (response.ok) {
    const data = response.data?.enrollments ?? response.data ?? [];
    enrollments = Array.isArray(data) ? data.map(mapEnrollment) : [];
  } else {
    enrollments = [];
  }

  initialized = true;
  notify();
}

export function areEnrollmentsInitialized() {
  return initialized;
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

export async function createEnrollment(userId: string, course: Course) {
  if (hasEnrollment(userId, course.slug)) {
    return null;
  }

  const response = await createEnrollmentApi(course.id);
  if (!response.ok) {
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
  notify();
  return enrollment;
}

export async function seedEnrollments(userId: string, courses: Course[]) {
  await Promise.all(courses.map((course) => {
    return createEnrollment(userId, course);
  }));
}

export async function updateEnrollmentProgress(enrollmentId: string, patch: Partial<Enrollment>) {
  const current = enrollments.find((enrollment) => enrollment.id === enrollmentId);
  const nextProgress = patch.progress ?? current?.progress ?? 0;

  void updateEnrollmentApi(enrollmentId, nextProgress).catch(() => {});

  enrollments = enrollments.map((enrollment) =>
    enrollment.id === enrollmentId ? { ...enrollment, ...patch } : enrollment,
  );
  notify();
}
