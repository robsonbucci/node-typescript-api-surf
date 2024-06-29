import { InternalError } from '@src/util/errors/internal-error';
import axios, { AxiosStatic } from 'axios';
import 'dotenv/config';

export interface IStormGlassPointSource {
  [key: string]: number;
}

export interface IStormGlassPoint {
  time: string;
  readonly windSpeed: IStormGlassPointSource;
  readonly waveHeight: IStormGlassPointSource;
  readonly swellHeight: IStormGlassPointSource;
  readonly swellPeriod: IStormGlassPointSource;
  readonly waveDirection: IStormGlassPointSource;
  readonly windDirection: IStormGlassPointSource;
  readonly swellDirection: IStormGlassPointSource;
}
export interface IStormGlassForescastResponse {
  hours: IStormGlassPoint[];
}

export interface IForecastPoint {
  time: string;
  windSpeed: number;
  waveHeight: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  windDirection: number;
  swellDirection: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(protected request: AxiosStatic = axios) {}

  public async fetchPoints(
    lat: number,
    lng: number
  ): Promise<IForecastPoint[]> {
    try {
      const response = await this.request.get<IStormGlassForescastResponse>(
        `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`,
        {
          headers: {
            Authorization: process.env.API_STORMGLASS,
          },
        }
      );
      return this.normalizeResponse(response.data);
    } catch (error: any) {
      if (error.response && error.response.status)
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(error.response.data)} Code: ${error.response.status}`
        );
      throw new ClientRequestError(error.message);
    }
  }

  private normalizeResponse(
    points: IStormGlassForescastResponse
  ): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      windSpeed: point.windSpeed[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      swellDirection: point.swellDirection[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.windSpeed?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.swellDirection?.[this.stormGlassAPISource]
    );
  }
}
