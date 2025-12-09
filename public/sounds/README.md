# Notification Sounds

This directory contains notification sound files for the application.

## Files

- `order-placed.mp3` - Sound when a buyer places an order
- `order-confirmed.mp3` - Sound when a seller confirms an order
- `order-ready.mp3` - Sound when food is ready for pickup
- `order-completed.mp3` - Sound when an order is completed
- `message.mp3` - Sound for general notifications

## Usage

These sounds are played by the notification system in `src/utils/notificationSounds.ts`.

## Format

All sounds should be:

- MP3 format for broad browser compatibility
- Short duration (< 2 seconds)
- Normalized volume
- Small file size (< 50KB each)

## Sources

You can generate notification sounds using:

- https://notificationsounds.com/
- https://mixkit.co/free-sound-effects/notification/
- Or create custom sounds with audio editing software
