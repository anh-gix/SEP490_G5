import React from 'react';
import { Form, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { QUIZ_TYPES } from './camSessionHelpers';

/**
 * Modal content cho Multiple Choice Quiz
 * Cấu trúc: 1 câu hỏi, nhiều lựa chọn, 1 đáp án đúng
 */
export const MultipleChoiceQuizForm = ({ 
  editItemData, 
  canEdit, 
  handleModalFieldChange,
  handleModalImageFileChange,
  handleModalAnswerList,
  handleModalAddAnswer,
  handleModalRemoveAnswer
}) => {
  const quizType = QUIZ_TYPES[editItemData.Type];
  
  return (
    <>
      {/* Image */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Ảnh đề bài</Form.Label>
        <Form.Control
          value={editItemData.Img || ''}
          onChange={(e) => handleModalFieldChange('Img', e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={!canEdit}
        />
        {canEdit && (
          <>
            <Form.Text className="text-muted small d-block mb-2">
              Hoặc tải lên file ảnh:
            </Form.Text>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleModalImageFileChange(e, 'Img')}
            />
          </>
        )}
        {editItemData.Img && (
          <div className="mt-2">
            <img
              src={editItemData.Img}
              alt="Preview"
              className="w-100 rounded"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          </div>
        )}
      </Form.Group>

      {/* Question */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.questionLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={editItemData.Question || ''}
          onChange={(e) => handleModalFieldChange('Question', e.target.value)}
          placeholder={quizType.questionPlaceholder}
          disabled={!canEdit}
        />
      </Form.Group>

      {/* Answer Choices */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.answerLabel} <span className="text-danger">*</span>
        </Form.Label>
        {(editItemData.Answer || ['']).map((ans, idx) => (
          <div key={idx} className="d-flex gap-2 mb-2 align-items-start">
            <div className="flex-grow-1">
              <Form.Control
                value={ans}
                onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                placeholder={typeof quizType.answerPlaceholder === 'function' ? quizType.answerPlaceholder(idx) : quizType.answerPlaceholder}
                disabled={!canEdit}
              />
            </div>
            {canEdit && (
              <Button
                variant="outline-danger"
                size="sm"
                className="px-2 py-1"
                onClick={() => handleModalRemoveAnswer('Answer', idx)}
                disabled={(editItemData.Answer || []).length <= 2}
              >
                <i className="ph ph-x"></i>
              </Button>
            )}
          </div>
        ))}
        {canEdit && (
          <Button variant="outline-primary" size="sm" className="px-3 py-2" onClick={() => handleModalAddAnswer('Answer')}>
            <i className="ph ph-plus me-2"></i>
            Thêm lựa chọn
          </Button>
        )}
      </Form.Group>

      {/* Answer Key - Select from Answer list */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.answerKeyLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          value={editItemData.AnswerKey?.[0] || ''}
          onChange={(e) => handleModalAnswerList('AnswerKey', 0, e.target.value)}
          disabled={!canEdit}
        >
          <option value="">-- Chọn đáp án đúng --</option>
          {(editItemData.Answer || []).filter(a => a?.trim()).map((ans, idx) => (
            <option key={idx} value={ans}>{ans}</option>
          ))}
        </Form.Select>
      </Form.Group>
    </>
  );
};

/**
 * Modal content cho Yes/No Quiz
 * Cấu trúc: 1 đề bài chung, nhiều câu hỏi Yes/No, mỗi câu 1 đáp án
 */
export const YesNoQuizForm = ({ 
  editItemData, 
  canEdit, 
  handleModalFieldChange,
  handleModalImageFileChange,
  handleModalAnswerList,
  handleModalAddAnswer,
  handleModalRemoveAnswer
}) => {
  const quizType = QUIZ_TYPES[editItemData.Type];
  
  return (
    <>
      {/* Image */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Ảnh đề bài</Form.Label>
        <Form.Control
          value={editItemData.Img || ''}
          onChange={(e) => handleModalFieldChange('Img', e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={!canEdit}
        />
        {canEdit && (
          <>
            <Form.Text className="text-muted small d-block mb-2">
              Hoặc tải lên file ảnh:
            </Form.Text>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleModalImageFileChange(e, 'Img')}
            />
          </>
        )}
        {editItemData.Img && (
          <div className="mt-2">
            <img
              src={editItemData.Img}
              alt="Preview"
              className="w-100 rounded"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          </div>
        )}
      </Form.Group>

      {/* Question (Common instruction) */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.questionLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={editItemData.Question || ''}
          onChange={(e) => handleModalFieldChange('Question', e.target.value)}
          placeholder={quizType.questionPlaceholder}
          disabled={!canEdit}
        />
        <Form.Text className="text-muted small">
          Ví dụ: "Look at the picture and answer Yes or No"
        </Form.Text>
      </Form.Group>

      {/* Questions with Answers side by side */}
      <div className="mb-3">
        <Form.Label className="fw-semibold">
          Câu hỏi và đáp án <span className="text-danger">*</span>
        </Form.Label>
        <Alert variant="info" className="small mb-2">
          <i className="ph ph-info me-1"></i>
          Mỗi câu hỏi có 1 đáp án Yes hoặc No tương ứng
        </Alert>
        
        {(editItemData.Answer || ['']).map((question, idx) => (
          <div key={idx} className="mb-3 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Badge bg="secondary">Câu {idx + 1}</Badge>
              {canEdit && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="px-2 py-1"
                  onClick={() => {
                    handleModalRemoveAnswer('Answer', idx);
                    handleModalRemoveAnswer('AnswerKey', idx);
                  }}
                  disabled={(editItemData.Answer || []).length <= 1}
                >
                  <i className="ph ph-trash"></i>
                </Button>
              )}
            </div>
            
            <Row className="g-2">
              <Col md={8}>
                <Form.Label className="small">Câu hỏi</Form.Label>
                <Form.Control
                  value={question}
                  onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                  placeholder={typeof quizType.answerPlaceholder === 'function' ? quizType.answerPlaceholder(idx) : quizType.answerPlaceholder}
                  disabled={!canEdit}
                />
              </Col>
              <Col md={4}>
                <Form.Label className="small">Đáp án</Form.Label>
                <Form.Select
                  value={editItemData.AnswerKey?.[idx] || ''}
                  onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                  disabled={!canEdit}
                >
                  <option value="">-- Chọn --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
        ))}
        
        {canEdit && (
          <Button 
            variant="outline-primary" 
            size="sm"
            className="px-3 py-2"
            onClick={() => {
              handleModalAddAnswer('Answer');
              handleModalAddAnswer('AnswerKey');
            }}
          >
            <i className="ph ph-plus me-2"></i>
            Thêm câu hỏi
          </Button>
        )}
      </div>
    </>
  );
};

/**
 * Modal content cho Spell Quiz
 * Cấu trúc: 1 đề bài chung, nhiều gợi ý/câu hỏi, mỗi câu 1 từ cần đánh vần
 */
export const SpellQuizForm = ({ 
  editItemData, 
  canEdit, 
  handleModalFieldChange,
  handleModalImageFileChange,
  handleModalAnswerList,
  handleModalAddAnswer,
  handleModalRemoveAnswer
}) => {
  const quizType = QUIZ_TYPES[editItemData.Type];
  
  return (
    <>
      {/* Image */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Ảnh đề bài</Form.Label>
        <Form.Control
          value={editItemData.Img || ''}
          onChange={(e) => handleModalFieldChange('Img', e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={!canEdit}
        />
        {canEdit && (
          <>
            <Form.Text className="text-muted small d-block mb-2">
              Hoặc tải lên file ảnh:
            </Form.Text>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleModalImageFileChange(e, 'Img')}
            />
          </>
        )}
        {editItemData.Img && (
          <div className="mt-2">
            <img
              src={editItemData.Img}
              alt="Preview"
              className="w-100 rounded"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          </div>
        )}
      </Form.Group>

      {/* Question (Common instruction) */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.questionLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={editItemData.Question || ''}
          onChange={(e) => handleModalFieldChange('Question', e.target.value)}
          placeholder={quizType.questionPlaceholder}
          disabled={!canEdit}
        />
        <Form.Text className="text-muted small">
          Ví dụ: "Spell these animals in the picture"
        </Form.Text>
      </Form.Group>

      {/* Hints with Spell Answers side by side */}
      <div className="mb-3">
        <Form.Label className="fw-semibold">
          Đề bài và từ cần đánh vần <span className="text-danger">*</span>
        </Form.Label>
        <Alert variant="warning" className="small mb-2">
          <i className="ph ph-info me-1"></i>
          Answer: Đề bài/Câu hỏi cho học viên (ví dụ: "Number 1", "The first word"). AnswerKey: Từ đúng cần đánh vần (chỉ tiếng Anh).
        </Alert>
        
        {(editItemData.Answer || ['']).map((prompt, idx) => (
          <div key={idx} className="mb-3 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Badge bg="warning">Từ {idx + 1}</Badge>
              {canEdit && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="px-2 py-1"
                  onClick={() => {
                    handleModalRemoveAnswer('Answer', idx);
                    handleModalRemoveAnswer('AnswerKey', idx);
                  }}
                  disabled={(editItemData.Answer || []).length <= 1}
                >
                  <i className="ph ph-trash"></i>
                </Button>
              )}
            </div>
            
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="small">Đề bài/Câu hỏi <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={prompt}
                  onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                  placeholder={typeof quizType.answerPlaceholder === 'function' ? quizType.answerPlaceholder(idx) : quizType.answerPlaceholder}
                  disabled={!canEdit}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="small">Từ cần đánh vần <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  value={editItemData.AnswerKey?.[idx] || ''}
                  onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                  placeholder="Ví dụ: CAT (chỉ tiếng Anh)"
                  disabled={!canEdit}
                  style={{ fontWeight: 'bold', textTransform: 'uppercase' }}
                />
              </Col>
            </Row>
          </div>
        ))}
        
        {canEdit && (
          <Button 
            variant="outline-primary" 
            size="sm"
            className="px-3 py-2"
            onClick={() => {
              handleModalAddAnswer('Answer');
              handleModalAddAnswer('AnswerKey');
            }}
          >
            <i className="ph ph-plus me-2"></i>
            Thêm từ
          </Button>
        )}
      </div>
    </>
  );
};

/**
 * Modal content cho Word from Box Quiz
 * Cấu trúc: 1 đề bài chung, nhiều câu có chỗ trống (___), Word Box chứa các từ đúng
 */
export const WordFromBoxQuizForm = ({ 
  editItemData, 
  canEdit, 
  handleModalFieldChange,
  handleModalImageFileChange,
  handleModalAnswerList,
  handleModalAddAnswer,
  handleModalRemoveAnswer
}) => {
  const quizType = QUIZ_TYPES[editItemData.Type];
  
  // Count blanks
  const blanksCount = (editItemData.Answer || []).reduce((sum, sentence) => {
    return sum + (sentence.match(/___/g) || []).length;
  }, 0);
  
  return (
    <>
      {/* Image */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Ảnh đề bài</Form.Label>
        <Form.Control
          value={editItemData.Img || ''}
          onChange={(e) => handleModalFieldChange('Img', e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={!canEdit}
        />
        {canEdit && (
          <>
            <Form.Text className="text-muted small d-block mb-2">
              Hoặc tải lên file ảnh:
            </Form.Text>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleModalImageFileChange(e, 'Img')}
            />
          </>
        )}
        {editItemData.Img && (
          <div className="mt-2">
            <img
              src={editItemData.Img}
              alt="Preview"
              className="w-100 rounded"
              style={{ maxHeight: '200px', objectFit: 'cover' }}
            />
          </div>
        )}
      </Form.Group>

      {/* Question (Common instruction) */}
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.questionLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={editItemData.Question || ''}
          onChange={(e) => handleModalFieldChange('Question', e.target.value)}
          placeholder={quizType.questionPlaceholder}
          disabled={!canEdit}
        />
        <Form.Text className="text-muted small">
          Ví dụ: "Fill in the blanks with words from the box"
        </Form.Text>
      </Form.Group>

      {/* Sentences with blanks and correct words side by side */}
      <div className="mb-3">
        <Form.Label className="fw-semibold">
          Câu có chỗ trống và từ đúng <span className="text-danger">*</span>
        </Form.Label>
        <Alert variant="info" className="small mb-2">
          <i className="ph ph-info me-1"></i>
          Sử dụng <code>___</code> để đánh dấu chỗ trống. Mỗi chỗ trống tương ứng 1 từ trong Word Box.
        </Alert>
        <Alert variant="secondary" className="small">
          <i className="ph ph-lightbulb me-1"></i>
          Tổng số chỗ trống: <strong>{blanksCount}</strong> • Cần <strong>{blanksCount}</strong> từ trong Word Box
        </Alert>
        
        {(editItemData.Answer || ['']).map((sentence, idx) => {
          const blankCount = (sentence.match(/___/g) || []).length;
          
          return (
            <div key={idx} className="mb-3 p-3 border rounded bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Badge bg="info">
                  Câu {idx + 1} {blankCount > 0 && `(${blankCount} chỗ trống)`}
                </Badge>
                {canEdit && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="px-2 py-1"
                    onClick={() => handleModalRemoveAnswer('Answer', idx)}
                    disabled={(editItemData.Answer || []).length <= 1}
                  >
                    <i className="ph ph-trash"></i>
                  </Button>
                )}
              </div>
              
              <Form.Control
                as="textarea"
                rows={2}
                value={sentence}
                onChange={(e) => handleModalAnswerList('Answer', idx, e.target.value)}
                placeholder={typeof quizType.answerPlaceholder === 'function' ? quizType.answerPlaceholder(idx) : quizType.answerPlaceholder}
                disabled={!canEdit}
                className="mb-2"
              />
              
              {blankCount === 0 && (
                <Form.Text className="text-warning small">
                  <i className="ph ph-warning me-1"></i>
                  Chưa có chỗ trống (___)
                </Form.Text>
              )}
            </div>
          );
        })}
        
        {canEdit && (
          <Button 
            variant="outline-primary" 
            size="sm"
            className="px-3 py-2"
            onClick={() => handleModalAddAnswer('Answer')}
          >
            <i className="ph ph-plus me-2"></i>
            Thêm câu
          </Button>
        )}
      </div>

      {/* Word Box - Correct answers */}
      <div className="mb-3">
        <Form.Label className="fw-semibold">
          {quizType.wordBoxLabel} <span className="text-danger">*</span>
        </Form.Label>
        <Alert variant="info" className="small mb-2">
          <i className="ph ph-info me-1"></i>
          Danh sách các từ sẽ được trộn và hiển thị trong hộp để học viên chọn.
        </Alert>
        
        {(editItemData.AnswerKey || ['']).map((word, idx) => (
          <div key={idx} className="d-flex gap-2 mb-2 align-items-start">
            <div style={{ width: '40px', paddingTop: '8px' }}>
              <Badge bg="secondary">{idx + 1}</Badge>
            </div>
            <div className="flex-grow-1">
              <Form.Control
                value={word}
                onChange={(e) => handleModalAnswerList('AnswerKey', idx, e.target.value)}
                placeholder={`Từ thứ ${idx + 1}`}
                disabled={!canEdit}
              />
            </div>
            {canEdit && (
              <Button
                variant="outline-danger"
                size="sm"
                className="px-2 py-1"
                onClick={() => handleModalRemoveAnswer('AnswerKey', idx)}
                disabled={(editItemData.AnswerKey || []).length <= 1}
              >
                <i className="ph ph-x"></i>
              </Button>
            )}
          </div>
        ))}
        
        {canEdit && (
          <Button 
            variant="outline-primary" 
            size="sm"
            className="px-3 py-2"
            onClick={() => handleModalAddAnswer('AnswerKey')}
          >
            <i className="ph ph-plus me-2"></i>
            Thêm từ vào Word Box
          </Button>
        )}
        
        {blanksCount > 0 && blanksCount !== (editItemData.AnswerKey || []).filter(k => k?.trim()).length && (
          <Alert variant="warning" className="mt-2 small mb-0">
            <i className="ph ph-warning me-1"></i>
            Số từ trong Word Box ({(editItemData.AnswerKey || []).filter(k => k?.trim()).length}) phải bằng số chỗ trống ({blanksCount})
          </Alert>
        )}
      </div>
    </>
  );
};
