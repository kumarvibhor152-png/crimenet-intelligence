"""
PyTorch Neural Network Models for Criminal Intelligence Syndicate Analysis.
- SyndicateNet: Multi-class deep MLP with BatchNorm & Dropout for Role & Threat Prediction
- HawalaAutoencoder: Deep reconstruction network for financial smurfing & anomaly detection
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class SyndicateNet(nn.Module):
    def __init__(self, input_dim: int = 24, num_classes: int = 5):
        super(SyndicateNet, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.bn1 = nn.BatchNorm1d(64)
        self.drop1 = nn.Dropout(0.2)
        
        self.fc2 = nn.Linear(64, 32)
        self.bn2 = nn.BatchNorm1d(32)
        self.drop2 = nn.Dropout(0.1)
        
        self.out = nn.Linear(32, num_classes)
        
        # Threat score regression head
        self.threat_head = nn.Linear(32, 1)

    def forward(self, x: torch.Tensor):
        h1 = F.relu(self.bn1(self.fc1(x)))
        h1 = self.drop1(h1)
        
        h2 = F.relu(self.bn2(self.fc2(h1)))
        h2 = self.drop2(h2)
        
        logits = self.out(h2)
        # Threat score between 0 and 100
        threat = torch.sigmoid(self.threat_head(h2)) * 100.0
        
        return logits, threat

class HawalaAutoencoder(nn.Module):
    """
    Autoencoder for detecting illicit hawala transactions & structuring anomalies.
    High reconstruction error signals evasive Section 12 PMLA smurfing patterns.
    """
    def __init__(self, input_dim: int = 6):
        super(HawalaAutoencoder, self).__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 4),
            nn.ReLU()
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(4, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x: torch.Tensor):
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed

    def compute_anomaly_score(self, x: torch.Tensor) -> torch.Tensor:
        recon = self.forward(x)
        mse = torch.mean((x - recon) ** 2, dim=-1)
        return mse
