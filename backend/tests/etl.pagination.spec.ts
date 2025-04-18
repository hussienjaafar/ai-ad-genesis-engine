
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { fetchMetaInsights } from '../src/workers/etlWorker';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock MongoDB
jest.mock('mongodb');
const MockedMongoClient = MongoClient as jest.MockedClass<typeof MongoClient>;

// Extract fetchMetaInsights function for testing
// Note: We need to expose this function in the etlWorker.ts file
jest.mock('../src/workers/etlWorker', () => {
  const originalModule = jest.requireActual('../src/workers/etlWorker');
  return {
    ...originalModule,
    fetchMetaInsights: jest.fn()
  };
});

describe('ETL Pagination', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all pages of data from Meta API', async () => {
    // Mock first page of data with a paging.next link
    const firstPageResponse = {
      data: {
        data: [
          { ad_id: '123', impressions: '100', clicks: '10', spend: '5.00' },
          { ad_id: '456', impressions: '200', clicks: '20', spend: '10.00' }
        ],
        paging: {
          next: 'https://graph.facebook.com/v17.0/next-page'
        }
      }
    };

    // Mock second page of data with no next link (last page)
    const secondPageResponse = {
      data: {
        data: [
          { ad_id: '789', impressions: '300', clicks: '30', spend: '15.00' },
          { ad_id: '012', impressions: '400', clicks: '40', spend: '20.00' }
        ],
        paging: {}
      }
    };

    // Setup axios mock to return different responses for different URLs
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('next-page')) {
        return Promise.resolve(secondPageResponse);
      }
      return Promise.resolve(firstPageResponse);
    });

    // Call the function with test parameters
    const results = await fetchMetaInsights('test-token', '123456789', '2023-01-01');

    // Expect axios.get to have been called twice (for both pages)
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    
    // Verify first call
    expect(mockedAxios.get.mock.calls[0][0]).toContain('act_123456789/insights');
    
    // Verify second call
    expect(mockedAxios.get.mock.calls[1][0]).toBe('https://graph.facebook.com/v17.0/next-page');
    
    // Verify combined results
    expect(results).toHaveLength(4);
    expect(results[0].ad_id).toBe('123');
    expect(results[3].ad_id).toBe('012');
  });
});
