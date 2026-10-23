import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractBrands, flattenOffers } from '../../utils/parts';

async function requestParts({ number, brand }, { signal, rejectWithValue }) {
  const params = new URLSearchParams({ number });
  if (brand) params.set('brand', brand);

  try {
    const response = await fetch(`/api/parts?${params.toString()}`, { signal });
    const data = await response.json();

    if (!response.ok) {
      return rejectWithValue(data?.error || 'Не удалось получить данные.');
    }

    if (!Array.isArray(data?.goods)) {
      return rejectWithValue('Сервис вернул неожиданный формат данных.');
    }

    return data.goods;
  } catch (error) {
    if (signal.aborted) throw error;
    return rejectWithValue('Ошибка соединения. Проверьте подключение к сети.');
  }
}

export const fetchBrands = createAsyncThunk('catalog/fetchBrands', (number, api) =>
  requestParts({ number }, api)
);

export const fetchOffers = createAsyncThunk('catalog/fetchOffers', ({ number, brand }, api) =>
  requestParts({ number, brand }, api)
);

const initialState = {
  article: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  brandsRequestId: null,
  selectedBrand: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
  offersRequestId: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setArticle(state, action) {
      state.article = action.payload;
      state.brands = [];
      state.brandsStatus = 'idle';
      state.brandsError = null;
      state.brandsRequestId = null;
      state.selectedBrand = null;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequestId = null;
    },
    clearSelection(state) {
      state.selectedBrand = null;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequestId = null;
    },
    selectBrand(state, action) {
      state.selectedBrand = action.payload;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.brandsStatus = 'loading';
        state.brandsError = null;
        state.brandsRequestId = action.meta.requestId;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brands = extractBrands(action.payload);
        state.brandsStatus = 'succeeded';
        state.brandsRequestId = null;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) return;
        state.brandsStatus = action.meta.aborted ? 'idle' : 'failed';
        state.brandsError = action.meta.aborted ? null : (action.payload || action.error.message);
        state.brandsRequestId = null;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.offersStatus = 'loading';
        state.offersError = null;
        state.offersRequestId = action.meta.requestId;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offers = flattenOffers(action.payload);
        state.offersStatus = 'succeeded';
        state.offersRequestId = null;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) return;
        state.offersStatus = action.meta.aborted ? 'idle' : 'failed';
        state.offersError = action.meta.aborted ? null : (action.payload || action.error.message);
        state.offersRequestId = null;
      });
  },
});

export const { setArticle, clearSelection, selectBrand } = catalogSlice.actions;
export default catalogSlice.reducer;
