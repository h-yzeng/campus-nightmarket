/**
 * Image Service Tests
 *
 * Tests for image upload and management functionality including:
 * - Image validation (type, size)
 * - Image compression
 * - Profile photo upload
 * - Listing image upload
 * - Image deletion
 * - Placeholder image generation
 */

import {
  uploadProfilePhoto,
  uploadListingImage,
  deleteImage,
  getPlaceholderImageURL,
} from '../../src/services/storage/imageService';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type UploadResult,
} from 'firebase/storage';
import { storage } from '../../src/config/firebase';

// Mock Firebase Storage
jest.mock('firebase/storage');
jest.mock('../../src/config/firebase', () => ({
  storage: {},
}));

// Mock browser APIs used inside compressImage to prevent jsdom timeouts
class MockFileReader {
  public result: string | ArrayBuffer | null = 'data:';
  public onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL(file: Blob): void {
    void file;
    const event = { target: this } as unknown as ProgressEvent<FileReader>;
    this.onload?.call(this as unknown as FileReader, event);
  }
}

class MockImage {
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public width = 1600;
  public height = 1600;

  set src(_value: string) {
    this.onload?.();
  }
}

global.FileReader = MockFileReader as unknown as typeof FileReader;
global.Image = MockImage as unknown as typeof Image;

// Type for global object in Jest environment
declare const global: typeof globalThis & {
  HTMLCanvasElement: {
    prototype: {
      getContext: jest.Mock;
      toBlob: jest.Mock;
    };
  };
};

describe('Image Service', () => {
  const mockUserId = 'user-123';
  const mockDownloadURL = 'https://firebase.storage.com/images/test.jpg';
  const realCreateElement = document.createElement.bind(document);
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock canvas creation used inside compressImage
    createElementSpy = jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: jest.fn().mockReturnValue({ drawImage: jest.fn() }),
          toBlob: (callback: (blob: Blob | null) => void) => {
            callback(new Blob(['compressed'], { type: 'image/jpeg' }));
          },
        } as unknown as HTMLCanvasElement;
      }
      return realCreateElement(tagName);
    });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  describe('Image Validation', () => {
    it('should reject non-image file types', async () => {
      const invalidFile = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      });

      await expect(uploadProfilePhoto(mockUserId, invalidFile)).rejects.toThrow(
        'Invalid file type'
      );
    });

    it('should reject files over 5MB', async () => {
      // Create a 6MB file
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.jpg', {
        type: 'image/jpeg',
      });

      await expect(uploadProfilePhoto(mockUserId, largeFile)).rejects.toThrow('File too large');
    });

    it('should accept valid JPEG files', async () => {
      const validFile = new File(['content'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas and image for compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      const url = await uploadProfilePhoto(mockUserId, validFile);

      expect(url).toBe(mockDownloadURL);
    });

    it('should accept valid PNG files', async () => {
      const validFile = new File(['content'], 'photo.png', {
        type: 'image/png',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas and image for compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      const url = await uploadProfilePhoto(mockUserId, validFile);

      expect(url).toBe(mockDownloadURL);
    });

    it('should accept valid WebP files', async () => {
      const validFile = new File(['content'], 'photo.webp', {
        type: 'image/webp',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas and image for compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      const url = await uploadProfilePhoto(mockUserId, validFile);

      expect(url).toBe(mockDownloadURL);
    });
  });

  describe('uploadProfilePhoto', () => {
    it('should upload profile photo to correct path', async () => {
      const validFile = new File(['content'], 'profile.jpg', {
        type: 'image/jpeg',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas and image for compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      await uploadProfilePhoto(mockUserId, validFile);

      // Check that ref was called with correct path structure
      expect(ref).toHaveBeenCalled();
      const refCall = (ref as jest.Mock).mock.calls[0];
      expect(refCall[1]).toMatch(/^profiles\/user-123\/\d+\.jpg$/);
    });

    it('should compress profile photos to max 800x800', async () => {
      const validFile = new File(['content'], 'profile.jpg', {
        type: 'image/jpeg',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toBlob: jest.fn((callback) => {
          callback(new Blob(['compressed'], { type: 'image/jpeg' }));
        }),
      };

      jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

      await uploadProfilePhoto(mockUserId, validFile);

      // Verify canvas dimensions don't exceed 800x800
      expect(mockCanvas.width).toBeLessThanOrEqual(800);
      expect(mockCanvas.height).toBeLessThanOrEqual(800);
    });

    it('should handle upload errors', async () => {
      const validFile = new File(['content'], 'profile.jpg', {
        type: 'image/jpeg',
      });

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      await expect(uploadProfilePhoto(mockUserId, validFile)).rejects.toThrow(
        'Failed to upload profile photo'
      );
    });
  });

  describe('uploadListingImage', () => {
    it('should upload listing image to correct path', async () => {
      const validFile = new File(['content'], 'listing.jpg', {
        type: 'image/jpeg',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas and image for compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      await uploadListingImage(mockUserId, validFile);

      // Check that ref was called with correct path structure
      expect(ref).toHaveBeenCalled();
      const refCall = (ref as jest.Mock).mock.calls[0];
      expect(refCall[1]).toMatch(/^listings\/user-123\/\d+\.jpg$/);
    });

    it('should compress listing images to max 1200x1200', async () => {
      const validFile = new File(['content'], 'listing.jpg', {
        type: 'image/jpeg',
      });

      const mockSnapshot: UploadResult = {
        ref: {} as UploadResult['ref'],
        metadata: {} as UploadResult['metadata'],
      };

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      // Mock canvas
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toBlob: jest.fn((callback) => {
          callback(new Blob(['compressed'], { type: 'image/jpeg' }));
        }),
      };

      jest
        .spyOn(document, 'createElement')
        .mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

      await uploadListingImage(mockUserId, validFile);

      // Verify canvas dimensions don't exceed 1200x1200
      expect(mockCanvas.width).toBeLessThanOrEqual(1200);
      expect(mockCanvas.height).toBeLessThanOrEqual(1200);
    });

    it('should handle upload errors', async () => {
      const validFile = new File(['content'], 'listing.jpg', {
        type: 'image/jpeg',
      });

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (uploadBytes as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['compressed'], { type: 'image/jpeg' }));
      });

      await expect(uploadListingImage(mockUserId, validFile)).rejects.toThrow(
        'Failed to upload listing image'
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      const imageURL = 'https://firebase.storage.com/images/test.jpg';

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (deleteObject as jest.Mock).mockResolvedValue(undefined);

      await deleteImage(imageURL);

      expect(ref).toHaveBeenCalledWith(storage, imageURL);
      expect(deleteObject).toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      const imageURL = 'https://firebase.storage.com/images/test.jpg';

      (ref as jest.Mock).mockReturnValue('storage-ref');
      (deleteObject as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      // Should not throw, just log the error
      await expect(deleteImage(imageURL)).resolves.not.toThrow();
    });
  });

  describe('getPlaceholderImageURL', () => {
    it('should generate placeholder URL with seed', () => {
      const seed = 'user123';
      const url = getPlaceholderImageURL(seed);

      expect(url).toBe(`https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`);
    });

    it('should generate different URLs for different seeds', () => {
      const url1 = getPlaceholderImageURL('seed1');
      const url2 = getPlaceholderImageURL('seed2');

      expect(url1).not.toBe(url2);
      expect(url1).toContain('seed1');
      expect(url2).toContain('seed2');
    });
  });

  describe('Image Compression', () => {
    it('should handle compression failure gracefully', async () => {
      const validFile = new File(['content'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      // Mock canvas to fail compression
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        drawImage: jest.fn(),
      });
      global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(null); // Simulate compression failure
      });

      await expect(uploadProfilePhoto(mockUserId, validFile)).rejects.toThrow();
    });

    it('should handle missing canvas context', async () => {
      const validFile = new File(['content'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      // Mock canvas to return null context
      global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);

      await expect(uploadProfilePhoto(mockUserId, validFile)).rejects.toThrow();
    });
  });
});
