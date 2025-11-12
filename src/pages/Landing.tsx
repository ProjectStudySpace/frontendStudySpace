import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Calendar,
  TrendingUp,
  Zap,
  Check,
  ArrowRight,
  Star,
  Users,
  BookOpen,
  Clock,
  Sparkles,
  Target,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/topics");
    } else {
      navigate("/register");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                <Brain size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                MemoPal
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Características
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Cómo funciona
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Precios
              </a>
            </div>

            <div className="flex items-center gap-4">
              {!isAuthenticated && (
                <button
                  onClick={handleLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Iniciar sesión
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                {isAuthenticated ? "Ir al Dashboard" : "Comenzar gratis"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">
                  Sistema de repaso espaciado inteligente
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Aprende más rápido.{" "}
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Recuerda por más tiempo.
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                MemoPal utiliza algoritmos de repetición espaciada para ayudarte
                a memorizar cualquier cosa de forma eficiente. Desde idiomas
                hasta medicina, estudia inteligentemente y alcanza tus metas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Comenzar gratis
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-white border-2 border-gray-200 hover:border-indigo-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                >
                  Ver características
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Calificación 5.0 de usuarios
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={20} className="text-indigo-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      10K+
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Estudiantes activos</p>
                </div>
              </div>
            </div>

            {/* Right column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-8 shadow-2xl">
                {/* Mock UI */}
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Brain size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Sesión de estudio
                        </h3>
                        <p className="text-sm text-gray-500">
                          15 tarjetas pendientes
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Activo
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm text-gray-600 mb-2">
                      ¿Cuál es la capital de Francia?
                    </p>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-gray-900 font-medium">París</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {["Fácil", "Medio", "Difícil"].map((level, i) => (
                      <button
                        key={level}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                          i === 0
                            ? "bg-green-100 text-green-700"
                            : i === 1
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Zap size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Racha actual</p>
                      <p className="font-bold text-gray-900">15 días 🔥</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progreso</p>
                      <p className="font-bold text-gray-900">87% 📈</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-4">
              <Sparkles size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">
                Características poderosas
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para aprender mejor
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              MemoPal combina tecnología avanzada con principios de aprendizaje
              probados para maximizar tu retención.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Repaso espaciado inteligente",
                description:
                  "Algoritmos que programan automáticamente tus sesiones de repaso en el momento óptimo para maximizar la retención a largo plazo.",
                color: "from-indigo-500 to-purple-600",
              },
              {
                icon: Calendar,
                title: "Integración con Google Calendar",
                description:
                  "Sincroniza tus sesiones de estudio con tu calendario y recibe recordatorios automáticos para nunca perder una sesión.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: TrendingUp,
                title: "Seguimiento de progreso",
                description:
                  "Visualiza tu evolución con métricas detalladas, rachas de estudio y análisis de rendimiento en tiempo real.",
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: Zap,
                title: "Sistema de rachas",
                description:
                  "Mantén tu motivación alta con un sistema de rachas diarias que te incentiva a estudiar constantemente.",
                color: "from-orange-500 to-red-600",
              },
              {
                icon: BookOpen,
                title: "Organización por temas",
                description:
                  "Crea y gestiona tarjetas organizadas por materias con colores personalizados para una mejor organización visual.",
                color: "from-purple-500 to-pink-600",
              },
              {
                icon: Target,
                title: "Autoevaluación",
                description:
                  "Califica la dificultad de cada tarjeta y MemoPal ajustará automáticamente los intervalos de repaso.",
                color: "from-yellow-500 to-orange-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comienza en minutos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Solo tres pasos simples para empezar a mejorar tu aprendizaje
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Crea tus tarjetas",
                description:
                  "Agrega preguntas y respuestas sobre cualquier tema que quieras aprender. Organízalas por materias con colores personalizados.",
                icon: BookOpen,
              },
              {
                step: "2",
                title: "Estudia regularmente",
                description:
                  "MemoPal programa automáticamente tus sesiones de repaso. Solo sigue el plan y califica qué tan bien recordaste cada tarjeta.",
                icon: Calendar,
              },
              {
                step: "3",
                title: "Ve tu progreso",
                description:
                  "Observa cómo mejora tu retención con el tiempo. Mantén rachas diarias y alcanza tus metas de aprendizaje.",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight size={32} className="text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comienza gratis, crece cuando quieras
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elige el plan perfecto para tus necesidades de aprendizaje
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Gratis",
                price: "$0",
                description: "Perfecto para empezar",
                features: [
                  "Hasta 50 tarjetas",
                  "3 materias",
                  "Repaso espaciado básico",
                  "Acceso móvil",
                  "Estadísticas básicas",
                ],
                cta: "Comenzar gratis",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$9",
                description: "Para estudiantes serios",
                features: [
                  "Tarjetas ilimitadas",
                  "Materias ilimitadas",
                  "Repaso espaciado avanzado",
                  "Integración Google Calendar",
                  "Estadísticas avanzadas",
                  "Soporte prioritario",
                  "Sin anuncios",
                ],
                cta: "Comenzar prueba",
                highlighted: true,
              },
              {
                name: "Equipo",
                price: "$29",
                description: "Para grupos de estudio",
                features: [
                  "Todo en Pro",
                  "Hasta 10 miembros",
                  "Tarjetas compartidas",
                  "Tableros colaborativos",
                  "Gestión de equipo",
                  "Análisis de grupo",
                ],
                cta: "Contactar ventas",
                highlighted: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl scale-105"
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                <div className="text-center mb-6">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      plan.highlighted ? "text-indigo-100" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-5xl font-bold ${
                        plan.highlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`${
                        plan.highlighted ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      /mes
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.highlighted ? "bg-white/20" : "bg-green-100"
                        }`}
                      >
                        <Check
                          size={14}
                          className={
                            plan.highlighted ? "text-white" : "text-green-600"
                          }
                        />
                      </div>
                      <span
                        className={
                          plan.highlighted ? "text-indigo-50" : "text-gray-700"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para aprender de forma más inteligente?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Únete a miles de estudiantes que ya están mejorando su memoria con
            MemoPal
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            Comenzar gratis ahora
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Brain size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">MemoPal</span>
              </div>
              <p className="text-sm">
                La forma más inteligente de memorizar y retener información.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Guías
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Soporte
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Términos
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 MemoPal. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
