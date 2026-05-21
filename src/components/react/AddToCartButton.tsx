import { useState, useEffect } from "react";
import { useCart } from "./useCart";
import { useAuth } from "./useAuth";
import { useEnrollments } from "./useEnrollments";
import { createEnrollment } from "../../lib/enrollments";
import type { CartItem, Course } from "../../lib/types";

interface Props {
  item: CartItem;
  course?: Course;
  size?: "normal" | "large";
}

export default function AddToCartButton({ item, course, size = "normal" }: Props) {
  const { addToCart, removeFromCart, isInCart, initialized } = useCart();
  const { user } = useAuth();
  const { enrollments, initialized: enrollmentsReady } = useEnrollments();
  const [inCart, setInCart] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (initialized) {
      setInCart(isInCart(item.slug));
    }
  }, [initialized, isInCart, item.slug]);

  // Re-check on any cart change
  useEffect(() => {
    const check = () => setInCart(isInCart(item.slug));
    const interval = setInterval(check, 200);
    return () => clearInterval(interval);
  }, [isInCart, item.slug]);

  const isEnrolled =
    !!user &&
    enrollmentsReady &&
    enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.courseSlug === item.slug);

  const handleClick = async () => {
    setFeedback("");

    if (inCart) {
      await removeFromCart(item.slug);
      setInCart(false);
    } else {
      const added = await addToCart(item);
      if (!added) {
        setInCart(false);
        setFeedback("No se ha podido añadir. Revisa la conexión o inténtalo de nuevo.");
        window.setTimeout(() => setFeedback(""), 3500);
        return;
      }

      setInCart(true);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
  };

  const handleFreeEnrollment = async () => {
    if (!course) {
      return;
    }

    if (!user) {
      window.location.href = "/register";
      return;
    }

    if (isEnrolled) {
      window.location.href = "/mi-cuenta/mis-cursos";
      return;
    }

    const enrollment = await createEnrollment(user.id, course);
    if (!enrollment) {
      setFeedback("No se ha podido completar la inscripción. Inicia sesión de nuevo o revisa la API.");
      window.setTimeout(() => setFeedback(""), 3500);
      return;
    }

    setFeedback("Inscripción completada");
    window.setTimeout(() => setFeedback(""), 2200);
  };

  if (item.isFree) {
    return (
      <div>
        <button
          type="button"
          onClick={handleFreeEnrollment}
          className={`bg-[#00FF66] text-[#0A0A0A] font-bold hover:bg-[#00CC52] transition shadow-lg shadow-[#00FF66]/20 flex items-center gap-2 justify-center rounded-xl ${
            size === "large" ? "px-8 py-4 text-lg" : "px-6 py-3 text-sm"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {isEnrolled ? "Ir a mis cursos" : feedback && feedback.startsWith("Inscripción") ? feedback : "Inscribirme"}
        </button>
        {feedback && !feedback.startsWith("Inscripción") && (
          <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {feedback}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={`font-bold transition flex items-center gap-2 justify-center rounded-xl ${
          animating ? "scale-95" : "scale-100"
        } ${
          inCart
            ? "bg-[#1A1A1A] border-2 border-[#00FF66] text-[#00FF66] hover:bg-red-500/10 hover:border-red-500 hover:text-red-400"
            : "bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00CC52] shadow-lg shadow-[#00FF66]/20"
        } ${size === "large" ? "px-8 py-4 text-lg" : "px-6 py-3 text-sm"}`}
      >
        {inCart ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            En el carrito
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            Añadir — {item.price}€
          </>
        )}
      </button>
      {feedback && (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {feedback}
        </p>
      )}
    </div>
  );
}
