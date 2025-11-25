import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import HeaderOne from "../../components/HomePageforStudent/HeaderOne";
import Animation from "../../helper/Animation";
import Preloader from "../../helper/Preloader";
import { examService } from "../../services/examService";
import { useAuth } from "../../contexts/AuthContext";

const SpeakingExamPage = () => {
  const { examId, submissionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sectionData, setSectionData] = useState(null);
  const [recordings, setRecordings] = useState({}); // { questionNumber: blob }
  const [recordingUrls, setRecordingUrls] = useState({}); // { questionNumber: url }
  const [recordingStates, setRecordingStates] = useState({}); // { questionNumber: 'idle' | 'recording' | 'recorded' }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);
  const mediaRecorderRefs = useRef({}); // { questionNumber: MediaRecorder }
  const audioChunksRefs = useRef({}); // { questionNumber: Blob[] }

  const handleSubmit = useCallback(
    async (force = false) => {
      // Stop timer (if any)
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all recordings
      Object.keys(mediaRecorderRefs.current).forEach((qNum) => {
        const recorder = mediaRecorderRefs.current[qNum];
        if (recorder && recorder.state !== "inactive") {
          recorder.stop();
        }
      });

      // Prevent double submission unless forced
      if (submitting && !force) return;

      try {
        setSubmitting(true);

        // Create FormData for file upload
        const formData = new FormData();
        const answersArray = Object.keys(recordings).map((qNum) => {
          const recordingBlob = recordings[qNum];

          // Add recording file if exists
          if (recordingBlob) {
            const fileName = `question_${qNum}_${Date.now()}.webm`;
            formData.append(`question_${qNum}`, recordingBlob, fileName);
          }

          return {
            questionNumber: parseInt(qNum),
            answerText: "", // Không có text answer cho Speaking
            recordingUrl: recordingBlob ? `question_${qNum}` : "",
          };
        });

        formData.append("answers", JSON.stringify(answersArray));

        await examService.submitSpeakingAnswers(examId, submissionId, formData);

        // Navigate to result page
        navigate(`/exams/${examId}/submissions/${submissionId}/speaking/result`);
      } catch (err) {
        setError(err?.message || "Không thể nộp bài");
        setSubmitting(false);
      }
    },
    [submitting, recordings, examId, submissionId, navigate]
  );

  // Fetch section + initialize state
  useEffect(() => {
    // Đợi AuthContext hoàn thành việc kiểm tra authentication trước khi redirect
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    let cancelled = false;

    const fetchSection = async () => {
      try {
        setLoading(true);
        const data = await examService.getSpeakingSection(examId, submissionId);
        if (cancelled) return;

        setSectionData(data);

        // Initialize recording states from existing submission
        if (data.submission?.answers?.length > 0) {
          const existingStates = {};
          data.submission.answers.forEach((ans) => {
            if (ans.recordingUrl) {
              existingStates[ans.questionNumber] = "recorded";
            }
          });
          setRecordingStates(existingStates);
        } else {
          setRecordings({});
          setRecordingStates({});
        }

        // Initialize timer if duration exists
        if (data.section?.duration) {
          setTimeRemaining(data.section.duration * 60); // minutes -> seconds
        } else {
          setTimeRemaining(null);
        }

        setError(null);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Không thể tải phần thi Speaking");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSection();

    return () => {
      cancelled = true;
    };
  }, [examId, submissionId, isAuthenticated, authLoading, navigate]);

  // Timer effect: start interval once, stop when timeRemaining reaches 0, auto-submit
  useEffect(() => {
    // If timer already running, do nothing here (interval updates timeRemaining)
    if (timeRemaining === null) {
      return;
    }

    // If time is up
    if (timeRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Auto submit if not already submitting
      if (!submitting) {
        // call handleSubmit but allow submission even if submitting flag is stale
        handleSubmit(true);
      }
      return;
    }

    // If there's no interval yet, start it
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    // NOTE: we do NOT clear interval here on every re-run because we only create it when null.
    // Cleanup on unmount is handled in the separate effect below.

    // No cleanup here to avoid clearing interval each second (which would stop the timer)
  }, [timeRemaining, submitting, handleSubmit]);

  // Clear interval and cleanup on unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Stop all recordings
      Object.keys(mediaRecorderRefs.current).forEach((qNum) => {
        const recorder = mediaRecorderRefs.current[qNum];
        if (recorder && recorder.state !== "inactive") {
          recorder.stop();
        }
      });
      // Cleanup all recording URLs
      Object.values(recordingUrls).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

//Hàm format thời gian theo định dạng mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

//Hàm bắt đầu ghi âm
  const startRecording = async (questionNumber) => {
    try {
      // Xóa audio cũ của câu đó (nếu có)
      setRecordingUrls((prev) => {
        if (prev[questionNumber]) {
          URL.revokeObjectURL(prev[questionNumber]);
        }
        const newUrls = { ...prev };
        delete newUrls[questionNumber];
        return newUrls;
      });
      
      // Cleanup old recording blob
      setRecordings((prev) => {
        const newRecordings = { ...prev };
        delete newRecordings[questionNumber];
        return newRecordings;
      });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRefs.current[questionNumber] = mediaRecorder;
      audioChunksRefs.current[questionNumber] = audioChunks;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Cleanup old URL if exists
        setRecordingUrls((prev) => {
          if (prev[questionNumber]) {
            URL.revokeObjectURL(prev[questionNumber]);
          }
          return {
            ...prev,
            [questionNumber]: audioUrl,
          };
        });
        
        setRecordings((prev) => ({
          ...prev,
          [questionNumber]: audioBlob,
        }));
        setRecordingStates((prev) => ({
          ...prev,
          [questionNumber]: "recorded",
        }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingStates((prev) => ({
        ...prev,
        [questionNumber]: "recording",
      }));
    } catch (err) {
      setError("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = (questionNumber) => {
    const recorder = mediaRecorderRefs.current[questionNumber];
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  };

  const deleteRecording = (questionNumber) => {
    // Cleanup URL
    setRecordingUrls((prev) => {
      if (prev[questionNumber]) {
        URL.revokeObjectURL(prev[questionNumber]);
      }
      const newUrls = { ...prev };
      delete newUrls[questionNumber];
      return newUrls;
    });
    
    setRecordings((prev) => {
      const newRecordings = { ...prev };
      delete newRecordings[questionNumber];
      return newRecordings;
    });
    setRecordingStates((prev) => ({
      ...prev,
      [questionNumber]: "idle",
    }));
    delete mediaRecorderRefs.current[questionNumber];
    delete audioChunksRefs.current[questionNumber];
  };

  const getPDFUrl = () => {
    if (!sectionData?.section?.fileUrl) return null;
    if (sectionData.section.fileUrl.startsWith("http")) {
      return sectionData.section.fileUrl;
    }
    if (sectionData.section.fileUrl.startsWith("/")) {
      const API_PORT = import.meta.env.VITE_API_PORT;
      return `http://localhost:${API_PORT}${sectionData.section.fileUrl}`;
    }
    const API_PORT = import.meta.env.VITE_API_PORT;
    return `http://localhost:${API_PORT}/uploads/${sectionData.section.fileUrl}`;
  };

  const getQuestionData = useCallback(
    (questionNumber) => {
      if (!sectionData?.section?.questions) return { questionTitle: "", questionAnswer: [] };
      const question = sectionData.section.questions.find(
        (q) => q.questionNumber === questionNumber
      );
      return {
        questionTitle: question?.questionTitle || "",
        questionAnswer: question?.questionAnswer || [],
      };
    },
    [sectionData]
  );

  const generateQuestionNumbers = () => {
    if (!sectionData?.section?.questionCount) return [];
    return Array.from({ length: sectionData.section.questionCount }, (_, i) => i + 1);
  };


  if (authLoading || loading) {
    return (
      <>
        <Preloader />
        <Animation />
        <HeaderOne />
        <div className="text-center py-80">
          <div className="spinner-border text-main-600" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Preloader />
      <Animation />
      

      <section className="py-40">
        <div className="container-fluid px-0">
          <div className="row g-0">
            {/* Left side - PDF Viewer (if available) */}
            {getPDFUrl() && (
              <div className="col-lg-6 col-md-6">
                <div
                  className="bg-white border-end border-neutral-30 h-100"
                  style={{ minHeight: "calc(100vh - 200px)" }}
                >
                  <div className="p-24 border-bottom border-neutral-30 flex-between gap-16">
                    <h4 className="mb-0">Đề thi Speaking</h4>
                    {timeRemaining !== null && (
                      <div className="flex-align gap-8">
                        <span className="text-2xl text-main-600">
                          <i className="ph ph-clock" />
                        </span>
                        <span
                          className={`text-lg fw-bold ${
                            timeRemaining < 300 ? "text-danger" : "text-neutral-700"
                          }`}
                        >
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-24" style={{ height: "calc(100vh - 280px)", overflow: "auto" }}>
                    <iframe
                      src={getPDFUrl()}
                      className="w-100 h-100 border-0 rounded-8"
                      title="Speaking PDF"
                      style={{ minHeight: "600px" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Right side - Speaking Area */}
            <div className={getPDFUrl() ? "col-lg-6 col-md-6" : "col-12"}>
              <div className="bg-main-25 h-100" style={{ minHeight: "calc(100vh - 200px)" }}>
                <div className="p-24 border-bottom border-neutral-30 bg-white">
                  <div className="flex-between gap-16 flex-wrap">
                    <div>
                      <h4 className="mb-8">Ghi âm câu trả lời</h4>
                      {sectionData?.section?.instructions && (
                        <p className="text-neutral-600 text-sm mb-0">
                          {sectionData.section.instructions}
                        </p>
                      )}
                    </div>
                    {timeRemaining !== null && !getPDFUrl() && (
                      <div className="flex-align gap-8">
                        <span className="text-2xl text-main-600">
                          <i className="ph ph-clock" />
                        </span>
                        <span
                          className={`text-lg fw-bold ${
                            timeRemaining < 300 ? "text-danger" : "text-neutral-700"
                          }`}
                        >
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="p-24"
                  style={{
                    height: getPDFUrl() ? "calc(100vh - 280px)" : "calc(100vh - 200px)",
                    overflow: "auto",
                  }}
                >
                  {error && (
                    <div className="alert alert-danger mb-24" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-24">
                    {generateQuestionNumbers().map((qNum) => {
                      const recordingState = recordingStates[qNum] || "idle";
                      const recordingUrl = recordingUrls[qNum] || null;

                      const questionData = getQuestionData(qNum);
                      return (
                        <div
                          key={qNum}
                          className="bg-white rounded-12 p-24 mb-24 border border-neutral-30"
                        >
                          <div className="flex-between gap-16 mb-16 flex-wrap">
                            <label className="fw-semibold text-neutral-700 text-lg">
                              Câu {qNum}
                            </label>
                            <div className="flex-align gap-8">
                              {recordingState === "recorded" && (
                                <span className="badge bg-success text-white px-12 py-4 rounded-pill">
                                  <i className="ph ph-check me-4" />
                                  Đã ghi âm
                                </span>
                              )}
                              {recordingState === "recording" && (
                                <span className="badge bg-danger text-white px-12 py-4 rounded-pill">
                                  <i className="ph ph-record me-4" />
                                  Đang ghi âm...
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Question Title */}
                          {questionData.questionTitle && (
                            <div className="mb-16">
                              <p className="text-neutral-700 fw-semibold mb-0">{questionData.questionTitle}</p>
                            </div>
                          )}

                          {/* Question Answers (if any) */}
                          {questionData.questionAnswer && questionData.questionAnswer.length > 0 && (
                            <div className="mb-16">
                              <p className="text-neutral-600 text-sm mb-8">Các đáp án:</p>
                              <div className="d-flex flex-column gap-4">
                                {questionData.questionAnswer.map((option, idx) => (
                                  <div key={idx} className="text-neutral-600 text-sm">
                                    <span className="fw-semibold">{option.key}.</span> {option.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recording Controls */}
                          <div className="mb-16">
                            <div className="d-flex gap-8 flex-wrap">
                              {recordingState === "idle" && (
                                <button
                                  onClick={() => startRecording(qNum)}
                                  className="btn btn-danger px-24 py-12 rounded-pill"
                                >
                                  <i className="ph ph-microphone me-8" />
                                  Bắt đầu ghi âm
                                </button>
                              )}
                              {recordingState === "recording" && (
                                <button
                                  onClick={() => stopRecording(qNum)}
                                  className="btn btn-danger px-24 py-12 rounded-pill"
                                >
                                  <i className="ph ph-stop me-8" />
                                  Dừng ghi âm
                                </button>
                              )}
                              {recordingState === "recorded" && (
                                <>
                                  <button
                                    onClick={() => deleteRecording(qNum)}
                                    className="btn btn-outline-danger px-24 py-12 rounded-pill"
                                  >
                                    <i className="ph ph-trash me-8" />
                                    Xóa
                                  </button>
                                  <button
                                    onClick={() => startRecording(qNum)}
                                    className="btn btn-outline-primary px-24 py-12 rounded-pill"
                                  >
                                    <i className="ph ph-microphone me-8" />
                                    Ghi lại
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Audio Player for recorded audio */}
                          {recordingUrl && recordingState === "recorded" && (
                            <div className="mb-16">
                              <audio
                                src={recordingUrl}
                                controls
                                className="w-100"
                                style={{ maxWidth: "100%" }}
                              />
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                  <div className="sticky-bottom bg-white border-top border-neutral-30 p-24 mt-24">
                    <div className="flex-between gap-16 flex-wrap">
                      <div>
                        <p className="text-neutral-600 text-sm mb-0">
                          Đã ghi âm:{" "}
                          {Object.keys(recordings).filter((qNum) => recordings[qNum]).length} /{" "}
                          {sectionData?.section?.questionCount || 0} câu
                        </p>
                      </div>
                      <button
                        onClick={() => handleSubmit()}
                        disabled={
                          submitting ||
                          Object.keys(recordings).filter((qNum) => recordings[qNum]).length === 0
                        }
                        className="btn btn-primary px-32 py-12 rounded-pill"
                      >
                        {submitting ? "Đang nộp..." : "Nộp bài"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SpeakingExamPage;

