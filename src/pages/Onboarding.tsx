import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin, Camera, Award } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const steps = [
    {
      icon: MapPin,
      title: "Welcome to CleanLink",
      description: "Report civic issues easily and help make your city cleaner.",
    },
    {
      icon: Camera,
      title: "Upload → Post → Verify",
      description: "Take a photo, add details, and let the community verify the issue.",
    },
    {
      icon: Award,
      title: "Earn Civic Sense Points",
      description: "Get rewarded for improving your neighborhood and unlock exclusive perks.",
    },
  ];

  const currentStep = steps[step - 1];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/login");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{currentStep.title}</h1>
          <p className="text-lg text-muted-foreground">
            {currentStep.description}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button onClick={handleNext} size="lg" className="w-full">
            {step < 3 ? "Next" : "Get Started"}
          </Button>
          {step < 3 && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
