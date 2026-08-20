import { useState } from "react";
import PromptBox from "../../components/lesson-plan/PromptBox";
import ILAWPreview from "./ILAWPreview";

const mockLessonPlan = {
  lesson_information: {
    title: "Human Person in a Society",
    learning_area: "Introduction to the Philosophy of the Human Person",
    teachers: [
      "Inah Ivy T. Alano",
      "Liza V. Tuico",
      "Eloisa D. Rubiato",
      "Iries P. Villafuerte",
      "Judith Francia",
    ],
    grade_level: "Grade 12",
    section: "",
    sessions: 5,
  },

  references: [
    "Dep Ed Curriculum Guide",
    "Module 7 - Introduction to the Philosophy of the Human Person",
    "Intersubjectivity",
  ],

  declaration_of_ai_use:
    "AI was utilized to organize the lesson plan into the ILAW format, align learning activities with the MATATAG framework, and provide instructional scaffolds appropriate for Grade 11/12 learners.",

  intentions: {
    content_standard:
      "The learner understands the interplay between the individuality of human beings and their social contexts.",

    performance_standard:
      "The learner evaluates the formation of human relationships and how individuals are shaped by their social contexts.",

    learning_competencies: [
      "Explain how human relations are transforming by social systems.",
    ],

    specific_objectives: [
      "Identify the key components of social systems and their functions in transforming human relations.",
      "Discuss how human relations are transforming by social systems.",
      "Analyze the impact of political patronage and economic inequality on human relationships and societal relationships.",
      "Demonstrate how human relations are transforming by social systems.",
    ],

    learning_objectives:
      "The learners will explain how human relationships are influenced by social systems, analyze situations involving human interaction, and demonstrate responsible participation in society.",

    learner_context:
      "The learners have prior knowledge about themselves, their relationships with others, and their roles in the community. They participate in discussions and group activities and can relate lesson concepts to their everyday experiences.",
  },

  learning_experiences: {
    learning_resources:
      "Slide deck presentation, position paper rubric, DepEd Curriculum Guide, and learning modules.",

    pre_lesson:
      "Review the previous lesson about intersubjectivity, focusing on the uniqueness, dignity, and ability of each person to make choices and interact with others.",

    flow_daylong: {
      activity:
        'Present the activity: "Connected to Society". Group the learners into small groups of four to five members. Give each group a situation that shows how a person interacts with others in society.',

      discussion:
        "Process the learners' responses using guide questions about interaction, responsibility, cooperation, and community participation.",

      deduction:
        "Guide the learners to realize that the human person is naturally a social being who develops through relationships and participation in society.",

      concepts: [
        "The Human Person as a Social Being",
        "Importance of Human Relationships",
        "Roles and Responsibilities in Society",
        "Respect for Others",
        "Cooperation and Community Participation",
      ],
    },

    opportunities_for_integration:
      "Integration of Values Education through respect, cooperation, empathy, and social responsibility; English through class discussions and reflection writing; Araling Panlipunan through understanding the roles and responsibilities of individuals in society; and ICT through the use of digital resources.",
  },

  assessment: {
    formative_assessment:
      "A. Agree or Disagree: Test the learners' understanding of the lesson by determining whether each statement is Agree or Disagree.\n\n1. Human beings naturally need relationships with other people.\n2. A person has no responsibility toward the community.\n3. Respecting others helps create a peaceful society.\n4. Cooperation is important in achieving common goals.\n5. Every person can contribute to the improvement of society.\n\nB. What Would You Do? Ask the learners to analyze a given situation and explain what they would do based on their understanding of the human person as a social being.",

    guide_questions: [
      "What problem is presented in the situation?",
      "What would you do if you were one of the group members?",
      "Why is cooperation important in this situation?",
      "How can you show respect and concern for the other person?",
      "How can your actions contribute to a positive and supportive group?",
    ],
  },

  ways_forward: {
    application:
      "Learners are encouraged to apply the values of respect, cooperation, responsibility, and empathy in their daily interactions with family, classmates, and community members.",

    extended_learning:
      'Extended Learning Opportunity: "My Role in Society". Learners observe and reflect on their role in their family, school, or community and write a short reflection describing their responsibilities, interactions, and ways they can contribute positively to their community.',

    reflections:
      "Reflect on what worked during the lesson, what learners found meaningful, what needs improvement, and what should be changed for the next session.",
  },

  prepared_checked_noted: {
    prepared_by: "MS. INAH IVY T. ALANO",
    checked_by: "DANCEL M. SAPIGAO, PhD",
    noted_by: "MS. LERNIE A. CALICA",
  },

  // Keep these for now.
  // We will restructure the Sessions UI later.
  sessions: [
    {
      session_number: 1,
      topic: "Understanding the Human Person",
      activities:
        "Interactive discussion, concept mapping, and guided reflection.",
      assessment:
        "Short reflection activity about the learner's understanding of the human person.",
    },
    {
      session_number: 2,
      topic: "The Human Person and Society",
      activities: "Group discussion and analysis of real-world situations.",
      assessment: "Group presentation and reflection.",
    },
    {
      session_number: 3,
      topic: "Human Relationships",
      activities: "Collaborative activity analyzing different relationships.",
      assessment: "Written analysis of a given scenario.",
    },
    {
      session_number: 4,
      topic: "Philosophical Reflection",
      activities: "Guided philosophical dialogue and individual reflection.",
      assessment: "Reflection paper.",
    },
    {
      session_number: 5,
      topic: "Integration and Application",
      activities: "Synthesis activity and classroom discussion.",
      assessment: "Performance task and short assessment.",
    },
  ],
};

export default function LessonPlanGenerator() {
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState(null);

  const handleGenerate = async (prompt) => {
    console.log("Teacher prompt:", prompt);

    if (!prompt?.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/ilaw/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          grade_level: "Grade 12",
          sessions: 5,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`ILAW generation failed: ${errorText}`);
      }

      const generatedPlan = await response.json();

      console.log("Generated ILAW:", generatedPlan);

      setLessonPlan(generatedPlan);
      setGenerated(true);
    } catch (error) {
      console.error("ILAW generation failed:", error);

      alert("Unable to generate ILAW. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  if (generated) {
    return (
      <ILAWPreview
        lessonPlan={lessonPlan}
        onBack={() => {
          setGenerated(false);
          setLessonPlan(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button className="text-sm text-gray-400 hover:text-white">
            ← Teacher Workspace
          </button>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
        <div className="flex w-full flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold md:text-4xl">
              Create an ILAW Lesson Plan
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Tell IMAC-AI what lesson plan you need. IMAC-AI will create and
              fill out the ILAW lesson plan for you.
            </p>
          </div>

          {isGenerating ? (
            <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#111722] p-10 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-green-500" />

              <h2 className="font-medium">
                IMAC-AI is creating your lesson plan...
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Analyzing your request and preparing the ILAW sections.
              </p>
            </div>
          ) : (
            <PromptBox onGenerate={handleGenerate} />
          )}
        </div>
      </main>
    </div>
  );
}
