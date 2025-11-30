import React, { useState, useEffect } from 'react';
import { MapPin, X, Navigation, Search } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface MapPickerProps {
  value: string;
  onChange: (coords: string) => void;
  onClose?: () => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ value, onChange, onClose }) => {
  const [lat, setLat] = useState<number>(-23.9608);
  const [lng, setLng] = useState<number>(-46.3332);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (value) {
      const coords = value.split(',').map((c) => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        setLat(coords[0]);
        setLng(coords[1]);
      }
    } else {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        () => {
          setLat(-23.9608);
          setLng(-46.3332);
        }
      );
    }
  }, [value]);

  const handleUseCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        onChange(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
      },
      () => {
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const newLat = parseFloat(data[0].lat);
        const newLng = parseFloat(data[0].lon);
        setLat(newLat);
        setLng(newLng);
        onChange(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
      } else {
        alert('Localização não encontrada. Tente outro termo de busca.');
      }
    } catch (error) {
      alert('Erro ao buscar localização. Tente novamente.');
    }
  };

  const updateCoords = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onChange(`${newLat.toFixed(6)}, ${newLng.toFixed(6)}`);
  };

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}`;
  const openMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Selecionar Coordenadas</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="p-4 space-y-4 flex-1 overflow-auto">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                    placeholder="Buscar localização (ex: Porto de Santos)"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSearch}
                >
                  Buscar
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleUseCurrentLocation}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Minha localização
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => window.open(openMapUrl, '_blank')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Abrir no mapa
            </Button>
          </div>

          <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ height: '400px' }}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              title="Mapa de seleção de coordenadas"
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-xs">
              <div className="font-semibold text-gray-700">Marcador no mapa</div>
              <div className="text-gray-600">Clique em "Abrir no mapa" para selecionar</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat.toFixed(6)}
                  onChange={(e) => {
                    const newLat = parseFloat(e.target.value);
                    if (!isNaN(newLat)) {
                      updateCoords(newLat, lng);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng.toFixed(6)}
                  onChange={(e) => {
                    const newLng = parseFloat(e.target.value);
                    if (!isNaN(newLng)) {
                      updateCoords(lat, newLng);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Coordenadas (formato: lat, lng)
              </label>
              <input
                type="text"
                value={value || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                onChange={(e) => {
                  onChange(e.target.value);
                  const coords = e.target.value.split(',').map((c) => parseFloat(c.trim()));
                  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    updateCoords(coords[0], coords[1]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent font-mono text-sm bg-white"
                placeholder="-23.9608, -46.3332"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose || (() => {})}>
            Cancelar
          </Button>
          <Button onClick={onClose || (() => {})}>
            Confirmar
          </Button>
        </div>
      </Card>
    </div>
  );
};

