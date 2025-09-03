// GPS 좌표를 구 단위로 변환하는 유틸리티

export interface DistrictInfo {
  district: string;
  city: string;
  fullName: string;
}

// 서울시 주요 구별 대략적인 GPS 좌표 범위
const SEOUL_DISTRICTS = [
  { name: '강남구', lat: [37.5, 37.6], lng: [127.0, 127.1] },
  { name: '강동구', lat: [37.5, 37.6], lng: [127.1, 127.2] },
  { name: '강북구', lat: [37.6, 37.7], lng: [127.0, 127.1] },
  { name: '강서구', lat: [37.5, 37.6], lng: [126.8, 126.9] },
  { name: '관악구', lat: [37.4, 37.5], lng: [126.9, 127.0] },
  { name: '광진구', lat: [37.5, 37.6], lng: [127.1, 127.2] },
  { name: '구로구', lat: [37.4, 37.5], lng: [126.8, 126.9] },
  { name: '금천구', lat: [37.4, 37.5], lng: [126.9, 127.0] },
  { name: '노원구', lat: [37.6, 37.7], lng: [127.1, 127.2] },
  { name: '도봉구', lat: [37.6, 37.7], lng: [127.0, 127.1] },
  { name: '동대문구', lat: [37.5, 37.6], lng: [127.0, 127.1] },
  { name: '동작구', lat: [37.4, 37.5], lng: [126.9, 127.0] },
  { name: '마포구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '서대문구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '서초구', lat: [37.4, 37.5], lng: [127.0, 127.1] },
  { name: '성동구', lat: [37.5, 37.6], lng: [127.0, 127.1] },
  { name: '성북구', lat: [37.5, 37.6], lng: [127.0, 127.1] },
  { name: '송파구', lat: [37.5, 37.6], lng: [127.1, 127.2] },
  { name: '양천구', lat: [37.5, 37.6], lng: [126.8, 126.9] },
  { name: '영등포구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '용산구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '은평구', lat: [37.6, 37.7], lng: [126.9, 127.0] },
  { name: '종로구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '중구', lat: [37.5, 37.6], lng: [126.9, 127.0] },
  { name: '중랑구', lat: [37.6, 37.7], lng: [127.1, 127.2] },
];

// 경기도 주요 시/구별 대략적인 GPS 좌표 범위
const GYEONGGI_DISTRICTS = [
  { name: '수원시', lat: [37.2, 37.3], lng: [126.9, 127.0] },
  { name: '성남시', lat: [37.4, 37.5], lng: [127.1, 127.2] },
  { name: '의정부시', lat: [37.7, 37.8], lng: [127.0, 127.1] },
  { name: '안양시', lat: [37.3, 37.4], lng: [126.9, 127.0] },
  { name: '부천시', lat: [37.5, 37.6], lng: [126.7, 126.8] },
  { name: '광명시', lat: [37.4, 37.5], lng: [126.8, 126.9] },
  { name: '평택시', lat: [37.0, 37.1], lng: [127.0, 127.1] },
  { name: '과천시', lat: [37.4, 37.5], lng: [126.9, 127.0] },
  { name: '오산시', lat: [37.1, 37.2], lng: [127.0, 127.1] },
  { name: '시흥시', lat: [37.3, 37.4], lng: [126.8, 126.9] },
  { name: '군포시', lat: [37.3, 37.4], lng: [126.9, 127.0] },
  { name: '의왕시', lat: [37.3, 37.4], lng: [126.9, 127.0] },
  { name: '하남시', lat: [37.5, 37.6], lng: [127.2, 127.3] },
  { name: '용인시', lat: [37.2, 37.3], lng: [127.1, 127.2] },
  { name: '파주시', lat: [37.7, 37.8], lng: [126.7, 126.8] },
  { name: '이천시', lat: [37.2, 37.3], lng: [127.4, 127.5] },
  { name: '안성시', lat: [37.0, 37.1], lng: [127.2, 127.3] },
  { name: '김포시', lat: [37.6, 37.7], lng: [126.6, 126.7] },
  { name: '화성시', lat: [37.1, 37.2], lng: [126.8, 126.9] },
  { name: '광주시', lat: [37.4, 37.5], lng: [127.2, 127.3] },
  { name: '여주시', lat: [37.2, 37.3], lng: [127.6, 127.7] },
  { name: '양평군', lat: [37.4, 37.5], lng: [127.4, 127.5] },
  { name: '고양시', lat: [37.6, 37.7], lng: [126.8, 126.9] },
  { name: '동두천시', lat: [37.9, 38.0], lng: [127.0, 127.1] },
  { name: '가평군', lat: [37.8, 37.9], lng: [127.5, 127.6] },
  { name: '연천군', lat: [38.0, 38.1], lng: [127.0, 127.1] },
];

// 울산광역시 구/군별 GPS 좌표 범위
const ULSAN_DISTRICTS = [
  { name: '중구', lat: [35.5, 35.6], lng: [129.3, 129.4] },
  { name: '남구', lat: [35.5, 35.6], lng: [129.3, 129.4] },
  { name: '동구', lat: [35.5, 35.6], lng: [129.4, 129.5] },
  { name: '북구', lat: [35.6, 35.7], lng: [129.3, 129.4] },
  { name: '울주군', lat: [35.5, 35.6], lng: [129.2, 129.3] },
];

/**
 * GPS 좌표를 기반으로 구/시 단위를 추정합니다.
 * @param latitude 위도
 * @param longitude 경도
 * @returns 구/시 정보
 */
export function getDistrictFromCoordinates(latitude: number, longitude: number): DistrictInfo {
  // 울산광역시 구/군 확인 (우선순위 높음)
  for (const district of ULSAN_DISTRICTS) {
    if (
      latitude >= district.lat[0] && latitude <= district.lat[1] &&
      longitude >= district.lng[0] && longitude <= district.lng[1]
    ) {
      return {
        district: district.name,
        city: '울산광역시',
        fullName: `울산광역시 ${district.name}`
      };
    }
  }

  // 서울시 구 확인
  for (const district of SEOUL_DISTRICTS) {
    if (
      latitude >= district.lat[0] && latitude <= district.lat[1] &&
      longitude >= district.lng[0] && longitude <= district.lng[1]
    ) {
      return {
        district: district.name,
        city: '서울특별시',
        fullName: `서울특별시 ${district.name}`
      };
    }
  }

  // 경기도 시/구 확인
  for (const district of GYEONGGI_DISTRICTS) {
    if (
      latitude >= district.lat[0] && latitude <= district.lat[1] &&
      longitude >= district.lng[0] && longitude <= district.lng[1]
    ) {
      return {
        district: district.name,
        city: '경기도',
        fullName: `경기도 ${district.name}`
      };
    }
  }

  // 울산 좌표 범위에 있으면 울산으로 기본 설정
  if (latitude >= 35.4 && latitude <= 35.8 && longitude >= 129.1 && longitude <= 129.6) {
    return {
      district: '중구',
      city: '울산광역시',
      fullName: '울산광역시 중구'
    };
  }

  // 기본값 (서울시 강남구)
  return {
    district: '강남구',
    city: '서울특별시',
    fullName: '서울특별시 강남구'
  };
}

/**
 * 구/시 이름을 기반으로 그룹 ID를 생성합니다.
 * @param districtInfo 구/시 정보
 * @returns 그룹 ID
 */
export function generateDistrictGroupId(districtInfo: DistrictInfo): string {
  let cityCode = 'OTHER';
  if (districtInfo.city === '서울특별시') {
    cityCode = 'SEOUL';
  } else if (districtInfo.city === '경기도') {
    cityCode = 'GYEONGGI';
  } else if (districtInfo.city === '울산광역시') {
    cityCode = 'ULSAN';
  }
  
  const districtCode = districtInfo.district.replace(/[시구군]/g, '').toUpperCase();
  return `district_${cityCode}_${districtCode}`;
}

/**
 * 주소 문자열을 파싱하여 구/시 정보를 추출합니다.
 * @param address 주소 문자열
 * @returns 구/시 정보 또는 null
 */
export function parseDistrictFromAddress(address: string): DistrictInfo | null {
  if (!address) return null;

  // 울산광역시 구/군 패턴 매칭
  const ulsanPattern = /울산광역시\s*([가-힣]+(?:구|군))/;
  const ulsanMatch = address.match(ulsanPattern);
  if (ulsanMatch) {
    return {
      district: ulsanMatch[1],
      city: '울산광역시',
      fullName: `울산광역시 ${ulsanMatch[1]}`
    };
  }

  // 서울시 구 패턴 매칭
  const seoulPattern = /서울특별시\s*([가-힣]+구)/;
  const seoulMatch = address.match(seoulPattern);
  if (seoulMatch) {
    return {
      district: seoulMatch[1],
      city: '서울특별시',
      fullName: `서울특별시 ${seoulMatch[1]}`
    };
  }

  // 경기도 시/구 패턴 매칭
  const gyeonggiPattern = /경기도\s*([가-힣]+(?:시|구|군))/;
  const gyeonggiMatch = address.match(gyeonggiPattern);
  if (gyeonggiMatch) {
    return {
      district: gyeonggiMatch[1],
      city: '경기도',
      fullName: `경기도 ${gyeonggiMatch[1]}`
    };
  }

  return null;
}