import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, Loader2, RefreshCw } from 'lucide-react';
import { Device } from '@twilio/voice-sdk';
import { toast } from 'sonner';
import { useAuthStore } from '../../lib/auth-store';
import { initializeTwilioDevice, getDevice, destroyDevice } from '../../lib/twilio-client';

export default function SoftPhone() {
  const { user } = useAuthStore();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [number, setNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);

  const setupDevice = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      const device = await initializeTwilioDevice(user.id);
      if (!device) throw new Error('Failed to initialize device');

      device.on('ready', () => {
        setIsReady(true);
        setIsConnecting(false);
        setIsInitialized(true);
        toast.success('Softphone ready');
      });

      device.on('error', (err) => {
        console.error('Twilio device error:', err);
        setError(err.message || 'Device error occurred');
        setIsReady(false);
        setIsInitialized(false);
      });

      device.on('connect', () => {
        setIsCallActive(true);
        toast.success('Call connected');
      });

      device.on('disconnect', () => {
        setIsCallActive(false);
        toast.info('Call ended');
      });

    } catch (error: any) {
      console.error('Softphone setup failed:', error);
      setError(error.message || 'Failed to setup softphone');
      setIsReady(false);
      setIsInitialized(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    destroyDevice();
    setIsInitialized(false);
    setIsReady(false);
    setError(null);
    await setupDevice();
  };

  const handleCall = async () => {
    const device = getDevice();
    if (!device || !isReady) {
      toast.error('Device not ready');
      return;
    }

    try {
      await device.connect({ params: { To: number } });
    } catch (err: any) {
      console.error('Call failed:', err);
      toast.error(err.message || 'Failed to place call');
    }
  };

  const handleHangup = () => {
    const device = getDevice();
    if (device) {
      device.disconnectAll();
    }
  };

  const toggleMute = () => {
    const device = getDevice();
    if (device) {
      const connection = device.activeConnection();
      if (connection) {
        connection.mute(!isMuted);
        setIsMuted(!isMuted);
      }
    }
  };

  const toggleSpeaker = () => {
    const device = getDevice();
    if (device) {
      device.audio?.speakerDevices.toggle();
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const handleKeyPress = (key: string) => {
    const device = getDevice();
    if (device && device.activeConnection()) {
      device.activeConnection()?.sendDigits(key);
    }
    setNumber(prev => prev + key);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    if (!isInitialized) {
      destroyDevice();
      setIsReady(false);
      setError(null);
    }
  };

  const handleMaximize = async () => {
    setIsMinimized(false);
    if (!isInitialized) {
      await setupDevice();
    }
  };

  if (!user || user.role !== 'collector') return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-card rounded-lg shadow-lg border border-border transition-all duration-200 ${isMinimized ? 'w-16' : 'w-80'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => isMinimized ? handleMaximize() : handleMinimize()}
          className="flex items-center space-x-2"
        >
          <Phone className={`w-5 h-5 ${isReady ? 'text-green-500' : 'text-muted-foreground'}`} />
          {!isMinimized && <span className="font-medium">Softphone</span>}
        </button>
        {!isMinimized && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={isConnecting}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md"
              title="Refresh connection"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleMinimize}>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : isConnecting ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              {/* Number Input */}
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              />

              {/* Dialpad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="p-3 text-center border border-input rounded-md hover:bg-muted"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                {isCallActive ? (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`p-2 rounded-md ${isMuted ? 'bg-destructive text-destructive-foreground' : 'hover:bg-muted'}`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleHangup}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleSpeaker}
                      className={`p-2 rounded-md ${!isSpeakerOn ? 'bg-destructive text-destructive-foreground' : 'hover:bg-muted'}`}
                    >
                      {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCall}
                    disabled={!number || !isReady}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Phone className="w-5 h-5 mx-auto" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}