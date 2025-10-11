import { imageStateStorage } from '../storage';

describe('ImageStateStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('saveUploadedImage', () => {
    it('should save uploaded image data to localStorage', () => {
      const preview = 'data:image/png;base64,test123';
      const fileName = 'test.png';
      const fileSize = 1024;
      const fileType = 'image/png';

      imageStateStorage.saveUploadedImage(preview, fileName, fileSize, fileType);

      const state = imageStateStorage.getImageState();

      expect(state.preview).toBe(preview);
      expect(state.fileName).toBe(fileName);
      expect(state.fileSize).toBe(fileSize);
      expect(state.fileType).toBe(fileType);
    });
  });

  describe('saveGeneratedPrompt', () => {
    it('should save generated prompt while preserving image data', () => {
      const preview = 'data:image/png;base64,test123';
      const fileName = 'test.png';
      const prompt = 'A beautiful sunset over the ocean';

      imageStateStorage.saveUploadedImage(preview, fileName, 1024, 'image/png');
      imageStateStorage.saveGeneratedPrompt(prompt);

      const state = imageStateStorage.getImageState();

      expect(state.preview).toBe(preview);
      expect(state.fileName).toBe(fileName);
      expect(state.generatedPrompt).toBe(prompt);
    });
  });

  describe('clearImageState', () => {
    it('should clear all image state data', () => {
      imageStateStorage.saveUploadedImage('test', 'test.png', 1024, 'image/png');
      imageStateStorage.saveGeneratedPrompt('test prompt');

      imageStateStorage.clearImageState();

      const state = imageStateStorage.getImageState();

      expect(state.preview).toBeNull();
      expect(state.fileName).toBeNull();
      expect(state.fileSize).toBeNull();
      expect(state.fileType).toBeNull();
      expect(state.generatedPrompt).toBeNull();
    });
  });

  describe('clearGeneratedPrompt', () => {
    it('should clear only the generated prompt while preserving image data', () => {
      const preview = 'data:image/png;base64,test123';
      const fileName = 'test.png';

      imageStateStorage.saveUploadedImage(preview, fileName, 1024, 'image/png');
      imageStateStorage.saveGeneratedPrompt('test prompt');
      imageStateStorage.clearGeneratedPrompt();

      const state = imageStateStorage.getImageState();

      expect(state.preview).toBe(preview);
      expect(state.fileName).toBe(fileName);
      expect(state.generatedPrompt).toBeNull();
    });
  });

  describe('persistence across tab switches', () => {
    it('should persist image state in localStorage', () => {
      const preview = 'data:image/png;base64,test123';
      const fileName = 'test.png';
      const fileSize = 2048;
      const fileType = 'image/png';
      const prompt = 'Generated prompt text';

      imageStateStorage.saveUploadedImage(preview, fileName, fileSize, fileType);
      imageStateStorage.saveGeneratedPrompt(prompt);

      // Simulate reading from localStorage (as would happen on tab switch)
      const stored = localStorage.getItem('image-to-prompt-image-state');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.preview).toBe(preview);
      expect(parsed.fileName).toBe(fileName);
      expect(parsed.fileSize).toBe(fileSize);
      expect(parsed.fileType).toBe(fileType);
      expect(parsed.generatedPrompt).toBe(prompt);
    });
  });
});
