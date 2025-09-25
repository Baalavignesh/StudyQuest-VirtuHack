// Client-side file upload service - uses API routes for OpenAI integration
import { UploadProgress } from '@/interfaces';

export type { UploadProgress };

export class FileUploadService {
  
  /**
   * Upload and process a syllabus file with OpenAI
   * @param file - The file to upload and process
   * @param onProgress - Callback for upload progress updates
   * @param teacherInfo - Optional teacher information for course creation
   * @returns Promise with the analysis result
   */
  static async uploadAndProcessSyllabus(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
    teacherInfo?: { uid: string; name: string; createCourse?: boolean }
  ): Promise<any> {
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF, Word, or text documents only.');
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload files smaller than 10MB.');
    }
    
    try {
      // Step 1: Upload file simulation
      if (onProgress) {
        onProgress({ progress: 10, status: 'uploading' });
      }
      
      // Step 1: Upload file to OpenAI via API
      if (onProgress) {
        onProgress({ progress: 30, status: 'uploading' });
      }
      
      const uploadResult = await this.uploadToOpenAI(file);
      
      if (onProgress) {
        onProgress({ progress: 50, status: 'processing', fileId: uploadResult.fileId });
      }
      
      // Step 2: Process with OpenAI using uploaded file
      const analysisResult = await this.processWithOpenAI(uploadResult.fileId, onProgress, teacherInfo);
      
      if (onProgress) {
        onProgress({ 
          progress: 100, 
          status: 'success',
          fileId: uploadResult.fileId,
          analysisResult
        });
      }
      
      return analysisResult;
      
    } catch (error: any) {
      if (onProgress) {
        onProgress({
          progress: 0,
          status: 'error',
          error: error.message
        });
      }
      throw error;
    }
  }
  
  /**
   * Upload file to OpenAI storage via API route
   * @param file - File to upload
   * @returns Promise with upload result
   */
  private static async uploadToOpenAI(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-syllabus', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to upload file to OpenAI: ${error.message}`);
    }
  }
  
  /**
   * Process uploaded file with OpenAI Assistant via API route
   * @param fileId - OpenAI file ID
   * @param onProgress - Progress callback
   * @param teacherInfo - Optional teacher information for course creation
   * @returns Analysis result from OpenAI
   */
  private static async processWithOpenAI(
    fileId: string, 
    onProgress?: (progress: UploadProgress) => void,
    teacherInfo?: { uid: string; name: string; createCourse?: boolean }
  ): Promise<any> {
    
    try {
      // Progress updates during analysis
      const progressSteps = [
        { progress: 60, message: 'Creating AI assistant...' },
        { progress: 70, message: 'Analyzing syllabus content...' },
        { progress: 80, message: 'Extracting course structure...' },
        { progress: 90, message: 'Generating gamification elements...' }
      ];
      
      // Start analysis via API
      const response = await fetch('/api/analyze-syllabus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileId,
          teacherUid: teacherInfo?.uid,
          teacherName: teacherInfo?.name,
          createCourse: teacherInfo?.createCourse || false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      // Simulate progress updates while waiting for response
      for (const step of progressSteps) {
        if (onProgress) {
          onProgress({ progress: step.progress, status: 'processing' });
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Include courseId in the analysis result if course was created
        return {
          ...result.analysisResult,
          ...(result.courseId && { courseId: result.courseId })
        };
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error: any) {
      throw new Error(`Failed to process file with OpenAI: ${error.message}`);
    }
  }
  
  /**
   * Get file info from a file object
   * @param file - The file to analyze
   * @returns File information
   */
  static getFileInfo(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: this.formatFileSize(file.size),
      lastModified: new Date(file.lastModified).toLocaleDateString()
    };
  }
  
  /**
   * Format file size in human readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}