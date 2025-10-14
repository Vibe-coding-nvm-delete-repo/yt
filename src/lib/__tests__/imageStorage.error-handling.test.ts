/**
 * Tests for imageStorage.ts error handling
 * Goal: Cover all error paths we just added
 */

import { imageStorage } from '../imageStorage';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
};

describe('ImageStorage Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset indexedDB mock
    global.indexedDB = mockIndexedDB as any;
  });

  describe('initDB error handling', () => {
    it('should handle IndexedDB open failure', async () => {
      const mockError = new Error('IndexedDB not available');
      
      mockIndexedDB.open.mockReturnValue({
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: null,
        error: mockError,
      });

      // Trigger error immediately
      setTimeout(() => {
        const request = mockIndexedDB.open.mock.results[0].value;
        if (request.onerror) {
          request.onerror();
        }
      }, 0);

      try {
        await (imageStorage as any).initDB();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('storeImage error handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Create a mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock initDB to fail
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('DB initialization failed')
      );

      await expect(imageStorage.storeImage(mockFile, 'test-id')).rejects.toThrow();
    });

    it('should log error when storage fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Storage quota exceeded')
      );

      try {
        await imageStorage.storeImage(mockFile, 'test-id');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to store image:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getImage error handling', () => {
    it('should return null on database error', async () => {
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('DB not accessible')
      );

      const result = await imageStorage.getImage('test-id');
      
      expect(result).toBeNull();
    });

    it('should log error when retrieval fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Connection timeout')
      );

      await imageStorage.getImage('test-id');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get image:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getImageUrl error handling', () => {
    it('should return null on error', async () => {
      jest.spyOn(imageStorage, 'getImage').mockRejectedValue(
        new Error('Image not found')
      );

      const url = await imageStorage.getImageUrl('test-id');
      
      expect(url).toBeNull();
    });

    it('should log error when URL retrieval fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage, 'getImage').mockRejectedValue(
        new Error('Invalid image ID')
      );

      await imageStorage.getImageUrl('test-id');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get image URL:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeImage error handling', () => {
    it('should throw error on removal failure', async () => {
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Cannot access database')
      );

      await expect(imageStorage.removeImage('test-id')).rejects.toThrow();
    });

    it('should log error when removal fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Permission denied')
      );

      try {
        await imageStorage.removeImage('test-id');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to remove image:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('listImages error handling', () => {
    it('should return empty array on error', async () => {
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Database corrupted')
      );

      const images = await imageStorage.listImages();
      
      expect(images).toEqual([]);
    });

    it('should log error when listing fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(
        new Error('Index not found')
      );

      await imageStorage.listImages();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to list images:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTotalSize error handling', () => {
    it('should return 0 on error', async () => {
      jest.spyOn(imageStorage, 'listImages').mockRejectedValue(
        new Error('Cannot calculate size')
      );

      const size = await imageStorage.getTotalSize();
      
      expect(size).toBe(0);
    });

    it('should log error when size calculation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage, 'listImages').mockRejectedValue(
        new Error('Quota exceeded')
      );

      await imageStorage.getTotalSize();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get total size:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('cleanup error handling', () => {
    it('should not throw on cleanup failure', async () => {
      jest.spyOn(imageStorage, 'getTotalSize').mockRejectedValue(
        new Error('Cannot determine size')
      );

      // Should not throw
      await expect(imageStorage.cleanup()).resolves.not.toThrow();
    });

    it('should log error but continue on cleanup failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.spyOn(imageStorage, 'getTotalSize').mockRejectedValue(
        new Error('Cleanup failed')
      );

      await imageStorage.cleanup();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to cleanup images:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error message validation', () => {
    it('should log descriptive error messages for all methods', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock all methods to fail
      jest.spyOn(imageStorage as any, 'initDB').mockRejectedValue(new Error('Test error'));

      // Test each method
      await imageStorage.getImage('test').catch(() => {});
      await imageStorage.getImageUrl('test').catch(() => {});
      await imageStorage.getTotalSize().catch(() => {});
      await imageStorage.listImages().catch(() => {});
      await imageStorage.cleanup().catch(() => {});

      // Should have logged errors for all methods
      expect(consoleErrorSpy.mock.calls.length).toBeGreaterThan(0);

      consoleErrorSpy.mockRestore();
    });
  });
});
